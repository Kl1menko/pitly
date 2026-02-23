#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROFILE_ID = "00000000-0000-0000-0000-000000000001";
const PAGE_SIZE = 1000;
const UPDATE_CHUNK = 200;

const NEGATIVE_NAME_PATTERNS = [
  /\brozetka\b/i,
  /\bрозетка\b/i,
  /\bnova poshta\b/i,
  /\bнова пошта\b/i,
  /\bпаркинг\b/i,
  /\bparking\b/i,
  /\bстоянк/i,
  /\bгараж\b/i,
  /^\s*го\s*$/i,
  /^\s*[a-zа-яіїєґ0-9]{1,2}\s*$/i
];

const NEGATIVE_TYPE_SET = new Set([
  "parking",
  "public_parking",
  "parking_lot",
  "park",
  "apartment_building",
  "lodging",
  "tourist_attraction"
]);

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
    citySlugs: null,
    jsonOut: null,
    applyPending: false,
    maxOutput: 30
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === "--city" && next) {
      args.citySlugs = [next];
      i += 1;
      continue;
    }
    if (token === "--cities" && next) {
      args.citySlugs = next.split(",").map((v) => v.trim()).filter(Boolean);
      i += 1;
      continue;
    }
    if (token === "--json-out" && next) {
      args.jsonOut = next;
      i += 1;
      continue;
    }
    if (token === "--apply-pending-suspicious") {
      args.applyPending = true;
      continue;
    }
    if (token === "--max-output" && next) {
      args.maxOutput = Number(next) || args.maxOutput;
      i += 1;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/review-imported-partners.mjs [options]

Options:
  --city <slug>                      Review one city
  --cities <a,b,c>                   Review selected cities
  --json-out <path>                  Write full report to JSON
  --apply-pending-suspicious         Set suspicious imported partners status='pending'
  --max-output <n>                   How many suspicious/duplicate rows print (default: 30)
`);
      process.exit(0);
    }
  }
  return args;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function normalizeAddress(value) {
  return normalizeText(value)
    .replace(/\bвулиця\b/g, "вул")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bпроспект\b/g, "просп")
    .replace(/\bavenue\b/g, "ave");
}

function evaluateSuspicion(partner) {
  const reasons = [];
  const name = (partner.name || "").trim();
  const nameNorm = normalizeText(name);
  const addressNorm = normalizeAddress(partner.address || "");
  const types = Array.isArray(partner.google_types) ? partner.google_types : [];
  const hay = [name, partner.address || "", ...types].join(" ").toLowerCase();
  const hasServiceKeyword =
    /(sto|service|repair|wash|мийк|шиномонтаж|tire|tyre|detail|детейл|кузов|фарб|скло|glass|tow|евакуат|кондиц)/i.test(hay);
  const hasUsefulType = types.some((t) =>
    ["car_repair", "car_wash", "tire_shop", "auto_body_shop", "car_detailing_service"].includes(String(t))
  );
  const hasNegativeType = types.some((t) => NEGATIVE_TYPE_SET.has(String(t)));

  if (!name) reasons.push("missing_name");
  if (name && name.length < 3) reasons.push("name_too_short");
  if (NEGATIVE_NAME_PATTERNS.some((re) => re.test(name))) reasons.push("negative_name");
  if (!partner.address) reasons.push("missing_address");
  if (!partner.phone && !partner.website) reasons.push("no_contact");
  if (!partner.lat || !partner.lng) reasons.push("missing_coords");
  if (hasNegativeType && !hasServiceKeyword && !hasUsefulType) reasons.push("negative_type");
  if (partner.rating_count === 0) reasons.push("no_ratings");
  if (nameNorm && ["сто", "service", "car wash", "мийка", "шиномонтаж"].includes(nameNorm)) reasons.push("too_generic_name");

  let severity = 0;
  for (const reason of reasons) {
    if (["negative_name", "negative_type", "name_too_short"].includes(reason)) severity += 3;
    else if (["missing_address", "no_contact", "too_generic_name"].includes(reason)) severity += 1;
  }

  return {
    reasons,
    severity,
    hardReject: reasons.some((r) => ["negative_name", "negative_type", "name_too_short"].includes(r))
  };
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function fetchImportedPartners(supabase) {
  const rows = [];
  let from = 0;
  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("partners")
      .select(
        "id,name,slug,city_id,address,lat,lng,phone,website,status,rating_avg,rating_count,google_place_id,google_types,owner_profile_id,created_at,updated_at"
      )
      .not("google_place_id", "is", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(`Failed to load imported partners: ${error.message}`);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

async function main() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, ".env.local"));
  loadEnvFile(path.join(cwd, ".env"));
  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase env vars");

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const [{ data: cities, error: citiesError }, imported] = await Promise.all([
    supabase.from("cities").select("id,slug,name_ua").eq("is_active", true),
    fetchImportedPartners(supabase)
  ]);
  if (citiesError) throw new Error(`Failed to load cities: ${citiesError.message}`);

  const cityById = new Map((cities || []).map((c) => [c.id, c]));
  let rows = imported.map((p) => ({
    ...p,
    city_slug: cityById.get(p.city_id)?.slug ?? null,
    city_name_ua: cityById.get(p.city_id)?.name_ua ?? null
  }));

  if (args.citySlugs?.length) {
    const set = new Set(args.citySlugs);
    rows = rows.filter((r) => r.city_slug && set.has(r.city_slug));
  }

  const byCity = new Map();
  const byNameKey = new Map();
  const byAddressKey = new Map();
  const suspicious = [];
  const reasonCounts = new Map();

  for (const row of rows) {
    const cityKey = row.city_slug || row.city_id;
    byCity.set(cityKey, (byCity.get(cityKey) || 0) + 1);

    const nameKey = `${cityKey}::${normalizeText(row.name)}`;
    if (nameKey.endsWith("::")) continue;
    const listByName = byNameKey.get(nameKey) || [];
    listByName.push(row);
    byNameKey.set(nameKey, listByName);

    const addrKey = `${cityKey}::${normalizeAddress(row.address)}`;
    if (!addrKey.endsWith("::")) {
      const listByAddress = byAddressKey.get(addrKey) || [];
      listByAddress.push(row);
      byAddressKey.set(addrKey, listByAddress);
    }

    const evalRes = evaluateSuspicion(row);
    if (evalRes.reasons.length) {
      suspicious.push({
        id: row.id,
        google_place_id: row.google_place_id,
        name: row.name,
        city_slug: row.city_slug,
        address: row.address,
        status: row.status,
        owner_profile_id: row.owner_profile_id,
        reasons: evalRes.reasons,
        severity: evalRes.severity,
        hardReject: evalRes.hardReject
      });
      for (const reason of evalRes.reasons) {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      }
    }
  }

  const duplicateByName = [...byNameKey.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => ({ key, count: list.length, rows: list }))
    .sort((a, b) => b.count - a.count);

  const duplicateByAddress = [...byAddressKey.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => ({ key, count: list.length, rows: list }))
    .sort((a, b) => b.count - a.count);

  suspicious.sort((a, b) => b.severity - a.severity || a.name.localeCompare(b.name));
  const topCities = [...byCity.entries()].sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count }));
  const topReasons = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1]);

  const importedSystemOwnerCount = rows.filter((r) => r.owner_profile_id === SYSTEM_PROFILE_ID).length;
  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      imported_google_partners: rows.length,
      imported_with_system_owner: importedSystemOwnerCount,
      suspicious_count: suspicious.length,
      hard_reject_count: suspicious.filter((s) => s.hardReject).length,
      duplicate_name_groups: duplicateByName.length,
      duplicate_address_groups: duplicateByAddress.length
    },
    top_cities: topCities,
    top_reasons: topReasons,
    suspicious,
    duplicate_by_name: duplicateByName.map((g) => ({
      key: g.key,
      count: g.count,
      rows: g.rows.map((r) => ({ id: r.id, name: r.name, city_slug: r.city_slug, address: r.address, status: r.status }))
    })),
    duplicate_by_address: duplicateByAddress.map((g) => ({
      key: g.key,
      count: g.count,
      rows: g.rows.map((r) => ({ id: r.id, name: r.name, city_slug: r.city_slug, address: r.address, status: r.status }))
    }))
  };

  console.log("Review summary");
  console.log(JSON.stringify(report.totals, null, 2));
  console.log("\nTop cities (imported Google partners):");
  for (const row of topCities.slice(0, 15)) console.log(`- ${row.city}: ${row.count}`);
  console.log("\nTop suspicious reasons:");
  for (const [reason, count] of topReasons.slice(0, 12)) console.log(`- ${reason}: ${count}`);

  console.log(`\nSuspicious sample (top ${Math.min(args.maxOutput, suspicious.length)}):`);
  for (const item of suspicious.slice(0, args.maxOutput)) {
    const ownerTag = item.owner_profile_id === SYSTEM_PROFILE_ID ? "google-system-owner" : "has-owner";
    console.log(`- [${item.city_slug}] ${item.name} | ${item.address || "no address"} | ${item.reasons.join(",")} | ${ownerTag}`);
  }

  console.log(`\nDuplicate name groups (top ${Math.min(args.maxOutput, duplicateByName.length)}):`);
  for (const group of duplicateByName.slice(0, args.maxOutput)) {
    const first = group.rows[0];
    console.log(`- ${group.count}x [${first.city_slug}] ${first.name}`);
  }

  if (args.applyPending) {
    const ids = suspicious.filter((s) => s.hardReject).map((s) => s.id);
    let updated = 0;
    for (const idsChunk of chunk(ids, UPDATE_CHUNK)) {
      const { error } = await supabase.from("partners").update({ status: "pending" }).in("id", idsChunk);
      if (error) throw new Error(`Failed to update suspicious partners: ${error.message}`);
      updated += idsChunk.length;
    }
    console.log(`\nApplied status='pending' to ${updated} suspicious imported partners`);
  }

  if (args.jsonOut) {
    const outPath = path.resolve(process.cwd(), args.jsonOut);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved report: ${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
