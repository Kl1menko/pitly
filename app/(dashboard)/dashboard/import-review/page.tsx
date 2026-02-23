import Link from "next/link";

import { PartnerCard } from "@/components/cards/partner-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { type Partner } from "@/lib/types";

type SearchParams = {
  city?: string;
  q?: string;
  status?: "active" | "pending" | "blocked" | "all";
  suspicious?: "1" | "0";
  limit?: string;
};

type RawImportedPartner = {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  verified: boolean | null;
  status: "active" | "pending" | "blocked";
  rating_avg: number | null;
  rating_count: number | null;
  owner_profile_id: string | null;
  google_place_id: string | null;
  google_types: string[] | null;
  partner_services?: { service_id: string }[];
};

const SYSTEM_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

const negativeNamePatterns = [
  /\brozetka\b/i,
  /\bрозетка\b/i,
  /\bnova poshta\b/i,
  /\bнова пошта\b/i,
  /\bпаркинг\b/i,
  /\bparking\b/i,
  /\bстоянк/i,
  /^\s*го\s*$/i,
  /^\s*[a-zа-яіїєґ0-9]{1,2}\s*$/i
];

function normalizeText(value?: string | null) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function evaluateSuspicion(row: RawImportedPartner) {
  const reasons: string[] = [];
  const name = (row.name || "").trim();
  const types = Array.isArray(row.google_types) ? row.google_types : [];
  const hay = [row.name || "", row.address || "", ...types].join(" ").toLowerCase();
  const hasServiceKeyword =
    /(sto|service|repair|wash|мийк|шиномонтаж|tire|tyre|detail|детейл|кузов|фарб|скло|glass|tow|евакуат|кондиц)/i.test(hay);
  const hasUsefulType = types.some((t) =>
    ["car_repair", "car_wash", "tire_shop", "auto_body_shop", "car_detailing_service"].includes(String(t))
  );

  if (!name) reasons.push("missing_name");
  if (name.length > 0 && name.length < 3) reasons.push("name_too_short");
  if (negativeNamePatterns.some((re) => re.test(name))) reasons.push("negative_name");
  if (!row.address) reasons.push("missing_address");
  if (!row.phone && !row.website) reasons.push("no_contact");
  if ((row.rating_count ?? 0) === 0) reasons.push("no_ratings");
  if (!hasServiceKeyword && !hasUsefulType) reasons.push("weak_relevance");

  return reasons;
}

export default async function ImportReviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ?? {};
  const q = (params.q || "").trim().toLowerCase();
  const cityFilter = (params.city || "all").trim();
  const statusFilter = (params.status || "all").trim() as SearchParams["status"];
  const suspiciousOnly = params.suspicious === "1";
  const limit = Math.min(Math.max(Number(params.limit || 60) || 60, 10), 200);

  const supabase = getSupabaseServiceRoleClient();

  const [{ data: cities, error: citiesError }, { count: importedCount, error: countError }, { data: rows, error: rowsError }] = await Promise.all([
    supabase.from("cities").select("id,slug,name_ua").eq("is_active", true).order("name_ua"),
    supabase.from("partners").select("id", { count: "exact", head: true }).not("google_place_id", "is", null),
    supabase
      .from("partners")
      .select(
        "id,name,slug,city_id,address,lat,lng,phone,website,description,verified,status,rating_avg,rating_count,owner_profile_id,google_place_id,google_types,partner_services(service_id)"
      )
      .not("google_place_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(5000)
  ]);

  if (citiesError) {
    return <div className="text-sm text-rose-700">Помилка завантаження міст: {citiesError.message}</div>;
  }
  if (rowsError) {
    return <div className="text-sm text-rose-700">Помилка завантаження імпортованих партнерів: {rowsError.message}</div>;
  }
  if (countError) {
    return <div className="text-sm text-rose-700">Помилка підрахунку імпортованих партнерів: {countError.message}</div>;
  }

  const cityById = new Map((cities ?? []).map((c) => [c.id, c]));

  const withMeta = ((rows as RawImportedPartner[] | null) ?? []).map((row) => {
    const city = cityById.get(row.city_id);
    const suspicionReasons = evaluateSuspicion(row);
    return {
      row,
      city,
      suspicionReasons,
      nameNorm: normalizeText(row.name),
      partner: {
        id: row.id,
        type: "sto",
        name: row.name,
        slug: row.slug,
        city_id: row.city_id,
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        phone: row.phone,
        description: row.description,
        verified: row.verified ?? false,
        status: row.status,
        rating_avg: row.rating_avg,
        rating_count: row.rating_count,
        services: (row.partner_services ?? []).map((s) => ({ id: s.service_id, name_ua: s.service_id }))
      } satisfies Partner
    };
  });

  const duplicateNameKeys = new Set(
    Object.entries(
      withMeta.reduce<Record<string, number>>((acc, item) => {
        const key = `${item.city?.slug || item.row.city_id}::${item.nameNorm}`;
        if (!item.nameNorm) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
  );

  let filtered = withMeta.filter((item) => item.row.owner_profile_id === SYSTEM_PROFILE_ID);

  if (cityFilter !== "all") {
    filtered = filtered.filter((item) => item.city?.slug === cityFilter);
  }
  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((item) => item.row.status === statusFilter);
  }
  if (q) {
    filtered = filtered.filter((item) => {
      const hay = [item.row.name, item.row.address || "", (item.row.google_types || []).join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  if (suspiciousOnly) {
    filtered = filtered.filter((item) => item.suspicionReasons.length > 0);
  }

  const summary = {
    totalImported: importedCount ?? withMeta.length,
    loadedPool: withMeta.length,
    filteredCount: filtered.length,
    suspiciousInFiltered: filtered.filter((x) => x.suspicionReasons.length > 0).length,
    duplicateNamesInFiltered: filtered.filter((x) => duplicateNameKeys.has(`${x.city?.slug || x.row.city_id}::${x.nameNorm}`)).length
  };

  const preview = filtered.slice(0, limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">Імпорт Google Places</p>
          <h1 className="text-2xl font-bold text-neutral-900">Прев’ю імпортованих партнерів</h1>
          <p className="text-sm text-neutral-600">
            Внутрішня сторінка для перевірки відображення, сміття та дублів перед публічним каталогом.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Усього в БД: {summary.totalImported}</Badge>
          <Badge variant="outline">Завантажено в ревʼю: {summary.loadedPool}</Badge>
          <Badge variant="outline">За фільтром: {summary.filteredCount}</Badge>
          <Badge className="bg-amber-50 text-amber-800">Підозрілі: {summary.suspiciousInFiltered}</Badge>
        </div>
      </div>

      <Card className="bg-white p-4 ring-1 ring-neutral-200">
        <form className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Пошук</label>
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Назва, адреса, google type"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Місто</label>
            <select
              name="city"
              defaultValue={cityFilter}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            >
              <option value="all">Усі міста</option>
              {(cities ?? []).map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name_ua}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Статус</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            >
              <option value="all">Усі</option>
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ліміт</label>
            <input
              type="number"
              name="limit"
              min={10}
              max={200}
              defaultValue={String(limit)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>

          <div className="md:col-span-5 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="suspicious" value="1" defaultChecked={suspiciousOnly} className="h-4 w-4" />
              Тільки підозрілі
            </label>
            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Застосувати
            </button>
            <Link href="/dashboard/import-review" className="text-sm font-semibold text-neutral-700 hover:text-neutral-900">
              Скинути
            </Link>
            <span className="text-xs text-neutral-500">Показано {preview.length} із {summary.filteredCount}</span>
            {summary.duplicateNamesInFiltered > 0 ? (
              <Badge className="bg-rose-50 text-rose-700">Потенційні дублікати назв: {summary.duplicateNamesInFiltered}</Badge>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {preview.map((item) => {
          const dupKey = `${item.city?.slug || item.row.city_id}::${item.nameNorm}`;
          const isDupName = duplicateNameKeys.has(dupKey);
          return (
            <Card key={item.row.id} className="bg-white p-4 ring-1 ring-neutral-200">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.city?.name_ua ?? item.row.city_id}</Badge>
                <Badge variant="outline">status: {item.row.status}</Badge>
                <Badge variant="outline">rating: {item.row.rating_avg ?? 0} ({item.row.rating_count ?? 0})</Badge>
                {isDupName ? <Badge className="bg-rose-50 text-rose-700">Дубль назви</Badge> : null}
                {item.suspicionReasons.length ? (
                  <Badge className="bg-amber-50 text-amber-800">Підозрілий: {item.suspicionReasons.join(", ")}</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700">Ок</Badge>
                )}
                {item.row.owner_profile_id === SYSTEM_PROFILE_ID ? (
                  <Badge className="bg-blue-50 text-blue-700">Google import</Badge>
                ) : null}
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
                <PartnerCard partner={item.partner} />
                <div className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Google Place ID</p>
                    <p className="break-all font-mono text-xs">{item.row.google_place_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Google types</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(item.row.google_types || []).slice(0, 12).map((type) => (
                        <Badge key={`${item.row.id}-${type}`} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Швидкі дії</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold hover:bg-white"
                        href={`/sto/${item.row.slug}`}
                      >
                        Відкрити сторінку
                      </Link>
                      {item.row.google_place_id ? (
                        <a
                          className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold hover:bg-white"
                          href={`https://www.google.com/maps/place/?q=place_id:${item.row.google_place_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Google Maps
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
