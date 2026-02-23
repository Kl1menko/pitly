#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_API_BASE = "https://places.googleapis.com/v1";
const GOOGLE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.regularOpeningHours",
  "places.currentOpeningHours"
].join(",");

const SYSTEM_PROFILE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_QUERY_TYPES = ["car_repair", "car_wash", "tire_shop"];
const SPLIT_THRESHOLD = 20;
const DB_CHUNK_SIZE = 100;
const MIN_NAME_LEN = 3;

const NEGATIVE_NAME_PATTERNS = [
  /\brozetka\b/i,
  /\bрозетка\b/i,
  /\bnova poshta\b/i,
  /\bнова пошта\b/i,
  /\bпаркинг\b/i,
  /\bparking\b/i,
  /\bстоянк/i,
  /\bстоянка\b/i,
  /\bgarage\b/i,
  /\bгараж\b/i,
  /^\s*го\s*$/i,
  /^\s*[a-zа-яіїєґ0-9]{1,2}\s*$/i
];

const NEGATIVE_TYPE_PATTERNS = [
  /^parking$/,
  /^public_parking$/,
  /^parking_lot$/,
  /^park$/,
  /^lodging$/,
  /^apartment_building$/,
  /^residential/,
  /^tourist_attraction$/,
  /^church$/,
  /^school$/,
  /^hospital$/,
  /^atm$/,
  /^bank$/,
  /^supermarket$/,
  /^shopping_mall$/,
  /^restaurant$/,
  /^cafe$/
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!key || process.env[key] != null) continue;
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {
    cityRadiusMeters: 12_000,
    minHalfSideMeters: 450,
    delayMs: 180,
    dryRun: false,
    citySlugs: null,
    maxCities: Infinity,
    types: [...DEFAULT_QUERY_TYPES]
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--city" && next) {
      args.citySlugs = [next];
      i += 1;
      continue;
    }
    if (token === "--cities" && next) {
      args.citySlugs = next
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
    if (token === "--max-cities" && next) {
      args.maxCities = Number(next) || args.maxCities;
      i += 1;
      continue;
    }
    if (token === "--city-radius" && next) {
      args.cityRadiusMeters = Number(next) || args.cityRadiusMeters;
      i += 1;
      continue;
    }
    if (token === "--min-cell" && next) {
      args.minHalfSideMeters = Number(next) || args.minHalfSideMeters;
      i += 1;
      continue;
    }
    if (token === "--delay" && next) {
      args.delayMs = Number(next) || args.delayMs;
      i += 1;
      continue;
    }
    if (token === "--types" && next) {
      const types = next
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      if (types.length) args.types = types;
      i += 1;
      continue;
    }
    if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/import-ukraine-places.mjs [options]

Options:
  --dry-run               Fetch only, do not write to Supabase
  --city <slug>           Import one city (e.g. kyiv)
  --cities <a,b,c>        Import a comma-separated list of city slugs
  --max-cities <n>        Limit number of cities
  --city-radius <meters>  Search radius from city center (default: 12000)
  --min-cell <meters>     Minimum half-cell size before stopping split (default: 450)
  --delay <ms>            Delay between Google API calls (default: 180)
  --types <a,b,c>         Google includedTypes (default: car_repair,car_wash,tire_shop)
`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function offsetLatLng(lat, lng, northMeters, eastMeters) {
  const dLat = northMeters / 111_320;
  const cosLat = Math.cos(toRadians(lat));
  const metersPerLngDegree = Math.max(111_320 * Math.max(cosLat, 0.01), 1);
  const dLng = eastMeters / metersPerLngDegree;
  return { lat: lat + dLat, lng: lng + dLng };
}

function buildChildCells(cell) {
  const childHalf = cell.halfSideMeters / 2;
  const offsets = [
    { north: childHalf, east: childHalf },
    { north: childHalf, east: -childHalf },
    { north: -childHalf, east: childHalf },
    { north: -childHalf, east: -childHalf }
  ];
  return offsets.map((offset) => {
    const point = offsetLatLng(cell.lat, cell.lng, offset.north, offset.east);
    return { lat: point.lat, lng: point.lng, halfSideMeters: childHalf };
  });
}

function clampNearbyRadius(halfSideMeters) {
  const r = Math.ceil(Math.sqrt(2) * halfSideMeters);
  return Math.max(100, Math.min(50_000, r));
}

function slugifyAscii(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function placeSlug(place, citySlug) {
  const base = slugifyAscii(place.displayName?.text || "");
  const idSuffix = String(place.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(-10);
  return [base || "place", citySlug, idSuffix || "g"]
    .filter(Boolean)
    .join("-")
    .slice(0, 120);
}

function inferServiceSlugs(place, matchedQueryTypes) {
  const slugs = new Set();
  for (const type of matchedQueryTypes) {
    if (type === "car_repair") {
      slugs.add("diagnostyka");
      slugs.add("tekh-obslugovuvannia");
    }
    if (type === "car_wash") {
      slugs.add("deteyl-myika");
    }
    if (type === "tire_shop") {
      slugs.add("shynomontazh");
      slugs.add("balansuvannia");
      slugs.add("remont-shyn");
    }
  }

  const hay = [place.displayName?.text || "", place.formattedAddress || "", ...(place.types || [])]
    .join(" ")
    .toLowerCase();

  if (/(detail|detailing|детейл|детейлін|полірув|полиров|ceramic|керам)/i.test(hay)) {
    slugs.add("poliruvannia");
    slugs.add("keramika-vosk");
    slugs.add("deteyl-myika");
  }

  if (/(мийк|wash|car wash)/i.test(hay)) {
    slugs.add("deteyl-myika");
  }

  if (/(шиномонтаж|tire|tyre)/i.test(hay)) {
    slugs.add("shynomontazh");
  }

  if (/(кондиц|ac service|air condition)/i.test(hay)) {
    slugs.add("kondytsionery");
    slugs.add("zapravka-kondytsionera");
  }

  if (/(діагност|diagnostic|diagnost)/i.test(hay)) {
    slugs.add("diagnostyka");
    slugs.add("diahnostyka-kondytsionera");
  }

  if (/(сто|service station|autoservice|auto service|repair)/i.test(hay)) {
    slugs.add("tekh-obslugovuvannia");
  }

  if (/(розвал|сходжен|alignment)/i.test(hay)) {
    slugs.add("rozval-shodzhennia");
  }

  if (/(баланс|balanc)/i.test(hay)) {
    slugs.add("balansuvannia");
  }

  if (/(шин|tire repair|tyre repair)/i.test(hay)) {
    slugs.add("remont-shyn");
  }

  if (/(кузов|body shop|рихтув)/i.test(hay)) {
    slugs.add("kuzovni-roboty");
  }

  if (/(фарб|paint|painter)/i.test(hay)) {
    slugs.add("farbuvannia");
  }

  if (/(pdr|вмятин|вмятин|вм'ятин)/i.test(hay)) {
    slugs.add("pdr");
  }

  if (/(скло|glass|windshield|windscreen)/i.test(hay)) {
    slugs.add("zamina-skla");
    slugs.add("remont-skla");
  }

  if (/(фар|headlight|lamp polishing)/i.test(hay)) {
    slugs.add("poliruvannia-far");
  }

  if (/(хімчист|химчист|interior cleaning)/i.test(hay)) {
    slugs.add("khimchystka-salonu");
  }

  if (/(тонув|tint)/i.test(hay)) {
    slugs.add("tonuvannia");
  }

  if (/(полірув|полиров|polish)/i.test(hay)) {
    slugs.add("poliruvannia");
  }

  if (/(евакуат|эвакуат|tow truck|towing)/i.test(hay)) {
    slugs.add("evakuatsiya");
  }

  return [...slugs];
}

const GOOGLE_DAY_TO_WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function hhmm(hour = 0, minute = 0) {
  const h = String(Number(hour) || 0).padStart(2, "0");
  const m = String(Number(minute) || 0).padStart(2, "0");
  return `${h}:${m}`;
}

function buildWorkHoursFromGoogle(place) {
  const src = place?.regularOpeningHours || place?.currentOpeningHours;
  const periods = Array.isArray(src?.periods) ? src.periods : [];
  if (!periods.length) return null;

  const byDay = new Map();
  for (const period of periods) {
    const open = period?.open;
    if (!open || typeof open.day !== "number") continue;
    const dayKey = GOOGLE_DAY_TO_WEEKDAY[open.day];
    if (!dayKey) continue;
    const close = period?.close && typeof period.close.day === "number" ? period.close : null;
    if (close && close.day !== open.day) {
      byDay.set(dayKey, { open: hhmm(open.hour, open.minute), close: "23:59", isOpen: true });
      const closeDayKey = GOOGLE_DAY_TO_WEEKDAY[close.day];
      if (closeDayKey) {
        byDay.set(closeDayKey, { open: "00:00", close: hhmm(close.hour, close.minute), isOpen: true });
      }
      continue;
    }

    const existing = byDay.get(dayKey);
    const next = {
      open: hhmm(open.hour, open.minute),
      close: close ? hhmm(close.hour, close.minute) : "23:59",
      isOpen: true
    };
    if (!existing) {
      byDay.set(dayKey, next);
      continue;
    }
    // Keep earliest open and latest close if multiple intervals for the same day.
    byDay.set(dayKey, {
      open: existing.open < next.open ? existing.open : next.open,
      close: existing.close > next.close ? existing.close : next.close,
      isOpen: true
    });
  }

  return byDay.size ? Object.fromEntries(byDay.entries()) : null;
}

function getPlaceTextBlob(place) {
  return [place.displayName?.text || "", place.formattedAddress || "", ...(place.types || [])]
    .join(" ")
    .toLowerCase();
}

function evaluatePlaceQuality(place) {
  const reasons = [];
  const name = (place.displayName?.text || "").trim();
  const types = Array.isArray(place.types) ? place.types : [];
  const primaryType = place.primaryType || null;
  const hay = getPlaceTextBlob(place);
  const hasServiceKeyword =
    /(sto|сТО|service|repair|wash|мийк|шиномонтаж|tire|tyre|detail|детейл|кузов|фарб|скло|glass|tow|евакуат|кондиц)/i.test(hay);
  const hasUsefulType = types.some((t) =>
    [
      "car_repair",
      "car_wash",
      "tire_shop",
      "auto_body_shop",
      "car_detailing_service",
      "car_dealer"
    ].includes(t)
  );
  const hasNegativeType = types.some((t) => NEGATIVE_TYPE_PATTERNS.some((re) => re.test(t)));
  const negativePrimaryType = primaryType && NEGATIVE_TYPE_PATTERNS.some((re) => re.test(primaryType));

  if (!name) reasons.push("missing_name");
  if (name && name.length < MIN_NAME_LEN) reasons.push("name_too_short");
  if (NEGATIVE_NAME_PATTERNS.some((re) => re.test(name))) reasons.push("negative_name");
  if (hasNegativeType && !hasUsefulType && !hasServiceKeyword) reasons.push("negative_type");
  if (negativePrimaryType && !hasUsefulType && !hasServiceKeyword) reasons.push("negative_primary_type");
  if (place.businessStatus && place.businessStatus !== "OPERATIONAL") reasons.push(`business_status_${String(place.businessStatus).toLowerCase()}`);
  if (!hasServiceKeyword && !hasUsefulType) reasons.push("weak_relevance");

  return {
    keep: !reasons.some((r) => r.startsWith("negative_") || r === "name_too_short" || r.startsWith("business_status_")),
    reasons
  };
}

async function fetchNearby(apiKey, params, retries = 3) {
  const response = await fetch(`${GOOGLE_API_BASE}/places:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": GOOGLE_FIELD_MASK
    },
    body: JSON.stringify(params)
  });

  const json = await response.json().catch(() => ({}));
  if (response.ok) return json;

  const message = json?.error?.message || `HTTP ${response.status}`;
  const retryable = response.status === 429 || response.status >= 500;
  if (retryable && retries > 0) {
    await sleep((4 - retries) * 800);
    return fetchNearby(apiKey, params, retries - 1);
  }
  throw new Error(message);
}

async function exploreCell(ctx, cell, depth) {
  const radius = clampNearbyRadius(cell.halfSideMeters);
  const payload = {
    includedTypes: [ctx.queryType],
    maxResultCount: 20,
    languageCode: "uk",
    regionCode: "UA",
    locationRestriction: {
      circle: {
        center: {
          latitude: cell.lat,
          longitude: cell.lng
        },
        radius
      }
    }
  };

  const data = await fetchNearby(ctx.apiKey, payload);
  await sleep(ctx.args.delayMs);
  ctx.stats.googleCalls += 1;

  const places = Array.isArray(data?.places) ? data.places : [];
  ctx.stats.rawPlaces += places.length;

  for (const place of places) {
    if (!place?.id) continue;
    const quality = evaluatePlaceQuality(place);
    if (!quality.keep) {
      ctx.stats.filteredOut += 1;
      for (const reason of quality.reasons) {
        ctx.stats.filterReasons.set(reason, (ctx.stats.filterReasons.get(reason) || 0) + 1);
      }
      continue;
    }
    const existing = ctx.collected.get(place.id);
    if (existing) {
      existing.queryTypes.add(ctx.queryType);
      continue;
    }
    ctx.collected.set(place.id, {
      place,
      city: ctx.city,
      queryTypes: new Set([ctx.queryType])
    });
  }

  const shouldSplit = places.length >= SPLIT_THRESHOLD && cell.halfSideMeters > ctx.args.minHalfSideMeters;
  if (!shouldSplit) return;

  ctx.stats.splitCells += 1;
  for (const child of buildChildCells(cell)) {
    await exploreCell(ctx, child, depth + 1);
  }
}

async function ensureSystemProfile(supabase) {
  const payload = {
    id: SYSTEM_PROFILE_ID,
    role: "admin",
    full_name: "Google Places Import"
  };
  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(`profiles upsert failed: ${error.message}`);
  }
}

async function upsertPartner(supabase, partnerRow) {
  const { data, error } = await supabase
    .from("partners")
    .upsert(partnerRow, { onConflict: "google_place_id" })
    .select("id")
    .single();
  if (error) {
    throw new Error(`partners upsert failed for ${partnerRow.google_place_id}: ${error.message}`);
  }
  return data.id;
}

async function upsertPartnerServices(supabase, partnerId, serviceIds) {
  if (!serviceIds.length) return;
  const rows = serviceIds.map((serviceId) => ({ partner_id: partnerId, service_id: serviceId }));
  const { error } = await supabase.from("partner_services").upsert(rows, { onConflict: "partner_id,service_id" });
  if (error) {
    throw new Error(`partner_services upsert failed for partner ${partnerId}: ${error.message}`);
  }
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function upsertPartnersBatch(supabase, partnerRows) {
  if (!partnerRows.length) return [];
  const { data, error } = await supabase
    .from("partners")
    .upsert(partnerRows, { onConflict: "google_place_id" })
    .select("id,google_place_id");
  if (error) {
    throw new Error(`partners batch upsert failed: ${error.message}`);
  }
  return data || [];
}

async function upsertPartnerServicesBatch(supabase, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from("partner_services").upsert(rows, { onConflict: "partner_id,service_id" });
  if (error) {
    throw new Error(`partner_services batch upsert failed: ${error.message}`);
  }
}

function toPartnerRow(record) {
  const { place, city, queryTypes } = record;
  return {
    owner_profile_id: SYSTEM_PROFILE_ID,
    type: "sto",
    name: place.displayName?.text || "Unnamed place",
    slug: placeSlug(place, city.slug),
    city_id: city.id,
    address: place.formattedAddress || null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
    website: place.websiteUri || null,
    description: null,
    work_hours: buildWorkHoursFromGoogle(place),
    verified: false,
    status: "active",
    rating_avg: place.rating ?? 0,
    rating_count: place.userRatingCount ?? 0,
    google_place_id: place.id,
    google_types: Array.isArray(place.types) ? place.types : [...queryTypes]
  };
}

async function main() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, ".env.local"));
  loadEnvFile(path.join(cwd, ".env"));

  const args = parseArgs(process.argv.slice(2));
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!googleApiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY)");
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const [{ data: cities, error: citiesError }, { data: services, error: servicesError }] = await Promise.all([
    supabase.from("cities").select("id, slug, name_ua, lat, lng, is_active").eq("is_active", true).order("name_ua"),
    supabase.from("services").select("id, slug").eq("is_active", true)
  ]);
  if (citiesError) throw new Error(`Failed to load cities: ${citiesError.message}`);
  if (servicesError) throw new Error(`Failed to load services: ${servicesError.message}`);

  const serviceIdBySlug = new Map((services || []).map((row) => [row.slug, row.id]));
  let selectedCities = (cities || []).filter((c) => c.lat != null && c.lng != null);
  if (args.citySlugs?.length) {
    const wanted = new Set(args.citySlugs);
    selectedCities = selectedCities.filter((c) => wanted.has(c.slug));
  }
  if (Number.isFinite(args.maxCities)) {
    selectedCities = selectedCities.slice(0, args.maxCities);
  }

  if (!selectedCities.length) {
    console.log("No cities selected");
    return;
  }

  if (!args.dryRun) {
    await ensureSystemProfile(supabase);
  }

  const globalStats = {
    cities: 0,
    googleCalls: 0,
    rawPlaces: 0,
    uniquePlaces: 0,
    filteredOut: 0,
    partnersUpserted: 0,
    partnerServicesUpserted: 0,
    splitCells: 0
  };

  console.log(
    `Import start: cities=${selectedCities.length}, types=${args.types.join(",")}, cityRadius=${args.cityRadiusMeters}m, dryRun=${args.dryRun}`
  );

  for (const city of selectedCities) {
    const collected = new Map();
    const cityStats = { googleCalls: 0, rawPlaces: 0, splitCells: 0, filteredOut: 0, filterReasons: new Map() };

    console.log(`\n[city] ${city.slug} (${city.name_ua})`);

    for (const queryType of args.types) {
      console.log(`  [type] ${queryType}`);
      const ctx = {
        apiKey: googleApiKey,
        args,
        city,
        queryType,
        collected,
        stats: cityStats
      };
      const rootCell = { lat: city.lat, lng: city.lng, halfSideMeters: args.cityRadiusMeters };
      try {
        await exploreCell(ctx, rootCell, 0);
      } catch (error) {
        console.error(`  [type:${queryType}] failed: ${error.message}`);
      }
    }

    const records = [...collected.values()];
    console.log(
      `  [found] unique=${records.length}, raw=${cityStats.rawPlaces}, filtered=${cityStats.filteredOut}, calls=${cityStats.googleCalls}, splits=${cityStats.splitCells}`
    );
    if (cityStats.filterReasons.size) {
      const topReasons = [...cityStats.filterReasons.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ");
      console.log(`  [filter] ${topReasons}`);
    }

    if (!args.dryRun) {
      for (const recordChunk of chunkArray(records, DB_CHUNK_SIZE)) {
        const prepared = recordChunk.map((record) => {
          const row = toPartnerRow(record);
          const inferredSlugs = inferServiceSlugs(record.place, record.queryTypes);
          const serviceIds = [...new Set(inferredSlugs.map((slug) => serviceIdBySlug.get(slug)).filter(Boolean))];
          return { record, row, serviceIds };
        });

        const upserted = await upsertPartnersBatch(
          supabase,
          prepared.map((item) => item.row)
        );
        const partnerIdByGoogleId = new Map(upserted.map((row) => [row.google_place_id, row.id]));

        const partnerServiceRows = [];
        for (const item of prepared) {
          const googlePlaceId = item.row.google_place_id;
          const partnerId = partnerIdByGoogleId.get(googlePlaceId);
          if (!partnerId) continue;
          for (const serviceId of item.serviceIds) {
            partnerServiceRows.push({ partner_id: partnerId, service_id: serviceId });
          }
        }

        await upsertPartnerServicesBatch(supabase, partnerServiceRows);
        globalStats.partnersUpserted += prepared.length;
        globalStats.partnerServicesUpserted += partnerServiceRows.length;
      }
    }

    globalStats.cities += 1;
    globalStats.googleCalls += cityStats.googleCalls;
    globalStats.rawPlaces += cityStats.rawPlaces;
    globalStats.uniquePlaces += records.length;
    globalStats.filteredOut += cityStats.filteredOut;
    globalStats.splitCells += cityStats.splitCells;
  }

  console.log("\nDone");
  console.log(JSON.stringify(globalStats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
