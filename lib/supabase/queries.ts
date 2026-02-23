import { demoBrands, demoCities, demoPartCategories, allDemoPartners, demoServices } from "@/lib/data/demo";
import { supabaseReady, getSupabaseServerClient } from "@/lib/supabase/server";
import { taxonomyServicesBySlug } from "@/lib/services/taxonomy";
import {
  type Partner,
  type PartnerType,
  type RepairRequestPayload,
  type PartsRequestPayload,
  type City,
  type Service,
  type PartCategory,
  type CarBrand,
  type CarModel
} from "@/lib/types";

function hhmmToMinutes(value?: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getWeekdayKey(date = new Date()) {
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[date.getDay()];
}

function isOpenToday(partner: Partner) {
  const day = partner.workHours?.[getWeekdayKey()];
  if (!day) return false;
  if (day.isOpen === false) return false;
  return Boolean(day.open && day.close);
}

function isOpenNow(partner: Partner) {
  const day = partner.workHours?.[getWeekdayKey()];
  if (!day || day.isOpen === false) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const open = hhmmToMinutes(day.open);
  const close = hhmmToMinutes(day.close);
  if (open == null || close == null) return false;
  return nowMin >= open && nowMin <= close;
}

function getRatingSortScore(partner: Pick<Partner, "rating_avg" | "rating_count">) {
  const avg = Number(partner.rating_avg ?? 0);
  const count = Number(partner.rating_count ?? 0);
  const priorMean = 4.2;
  const priorWeight = 8;
  return ((count * avg) + priorWeight * priorMean) / (count + priorWeight);
}

function sortPartnersByRatingConfidence(list: Partner[]) {
  return [...list].sort((a, b) => {
    const scoreDiff = getRatingSortScore(b) - getRatingSortScore(a);
    if (Math.abs(scoreDiff) > 0.0001) return scoreDiff;
    const countDiff = Number(b.rating_count ?? 0) - Number(a.rating_count ?? 0);
    if (countDiff !== 0) return countDiff;
    return Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0);
  });
}

function normalizeCatalogSearchText(value?: string | null) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPartnerQueryScore(partner: Partner, query: string) {
  const q = normalizeCatalogSearchText(query);
  if (!q) return 0;

  const name = normalizeCatalogSearchText(partner.name);
  const address = normalizeCatalogSearchText(partner.address);
  const district = normalizeCatalogSearchText(partner.district);
  const description = normalizeCatalogSearchText(partner.description);
  const servicesText = normalizeCatalogSearchText(
    (partner.services ?? [])
      .map((s) => (typeof s === "string" ? s : s.name_ua || s.id))
      .join(" ")
  );

  let score = 0;
  if (name === q) score += 1200;
  if (name.startsWith(q)) score += 700;
  if (name.includes(q)) score += 450;
  if (servicesText.includes(q)) score += 260;
  if (address.includes(q)) score += 180;
  if (district.includes(q)) score += 120;
  if (description.includes(q)) score += 60;

  // Small confidence bump from rating volume to stabilize ties.
  score += Math.min(Number(partner.rating_count ?? 0), 200) * 0.3;
  score += Number(partner.rating_avg ?? 0) * 2;
  return score;
}

function rerankPartnersByQuery(list: Partner[], query?: string) {
  if (!query?.trim()) return list;
  return [...list].sort((a, b) => {
    const scoreDiff = getPartnerQueryScore(b, query) - getPartnerQueryScore(a, query);
    if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
    return Number(b.rating_count ?? 0) - Number(a.rating_count ?? 0);
  });
}

export async function getCities(): Promise<City[]> {
  if (!supabaseReady) return demoCities;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("cities").select("*").eq("is_active", true).order("name_ua");
  if (error) {
    console.warn("Supabase getCities error", error);
    return demoCities;
  }
  return data ?? demoCities;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  if (!supabaseReady) return demoCities.find((c) => c.slug === slug) ?? null;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("cities").select("*").eq("slug", slug).single();
  if (error) {
    console.warn("Supabase getCityBySlug error", error);
    return demoCities.find((c) => c.slug === slug) ?? null;
  }
  return data;
}

type PartnerFilters = {
  q?: string;
  services?: string[];
  category?: string;
  brand?: string;
  categories?: string[];
  verified?: boolean;
  delivery?: boolean;
  partsSalesEnabled?: boolean;
  onlineBooking?: boolean;
  openToday?: boolean;
  openNow?: boolean;
  hasTowService?: boolean;
  mobileService?: boolean;
  evacOrMobile?: boolean;
  sort?: "rating" | "new";
};

export type PaginatedPartnersResult = {
  items: Partner[];
  total: number;
  page: number;
  perPage: number;
};

function paginateLocal(list: Partner[], page: number, perPage: number): PaginatedPartnersResult {
  const safePerPage = Math.max(1, perPage);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: list.slice((safePage - 1) * safePerPage, safePage * safePerPage),
    total,
    page: safePage,
    perPage: safePerPage
  };
}

function hasHeavyLocalOnlyFilters(filters?: PartnerFilters) {
  if (!filters) return false;
  return Boolean(filters.sort === "rating");
}

export async function getPartnersByCityPage(params: {
  type: PartnerType;
  cityId?: string;
  citySlug?: string;
  page?: number;
  perPage?: number;
  filters?: PartnerFilters;
}): Promise<PaginatedPartnersResult> {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const perPage = Math.max(1, Math.floor(params.perPage ?? 20));

  if (!supabaseReady || hasHeavyLocalOnlyFilters(params.filters)) {
    const all = await getPartnersByCity({
      type: params.type,
      cityId: params.cityId,
      citySlug: params.citySlug,
      filters: params.filters
    });
    return paginateLocal(all, page, perPage);
  }

  const supabase = getSupabaseServerClient();
  const city = params.cityId
    ? { id: params.cityId }
    : params.citySlug
      ? await getCityBySlug(params.citySlug)
      : null;
  if (!city) {
    const all = await getPartnersByCity({
      type: params.type,
      cityId: params.cityId,
      citySlug: params.citySlug,
      filters: params.filters
    });
    return paginateLocal(all, page, perPage);
  }

  const filters = params.filters;
  const needsBrandJoinFilter = Boolean(filters?.brand);
  const needsShopJoinFilter = params.type === "shop" && Boolean(filters?.delivery || filters?.categories?.length);
  const needsStoJoinFilter = params.type === "sto" && Boolean(filters?.services?.length || filters?.category);
  const selectClause = `*, partner_services!${needsStoJoinFilter ? "inner" : "left"}(service_id), shop_part_offers!${
    needsShopJoinFilter ? "inner" : "left"
  }(category_id, delivery_available), partner_car_compatibility!${needsBrandJoinFilter ? "inner" : "left"}(brand_id)`;

  let query = supabase
    .from("partners")
    .select(selectClause, { count: "exact" })
    .eq("type", params.type)
    .eq("city_id", city.id)
    .eq("status", "active");

  if (filters?.verified) query = query.eq("verified", true);
  if (filters?.onlineBooking && params.type === "sto") query = query.eq("online_booking_enabled", true);
  if (filters?.hasTowService && params.type === "sto") query = query.eq("has_tow_service", true);
  if (filters?.mobileService && params.type === "sto") query = query.eq("mobile_service", true);
  if (filters?.evacOrMobile && params.type === "sto") query = query.or("has_tow_service.eq.true,mobile_service.eq.true");
  if (filters?.partsSalesEnabled && params.type === "sto") query = query.eq("parts_sales_enabled", true);

  if (filters?.brand) {
    query = query.eq("partner_car_compatibility.brand_id", filters.brand);
  }

  if (params.type === "shop") {
    if (filters?.delivery) query = query.eq("shop_part_offers.delivery_available", true);
    if (filters?.categories?.length) query = query.in("shop_part_offers.category_id", filters.categories);
  }

  let servicesCatalogForSto: Service[] | null = null;
  if (params.type === "sto") {
    const servicesCatalog = await getServices();
    servicesCatalogForSto = servicesCatalog;
    const idsByCategory = new Map<string, string[]>();
    const idsBySlug = new Map<string, string>();
    for (const svc of servicesCatalog) {
      idsBySlug.set(svc.slug, svc.id);
      if (svc.categoryId) {
        const arr = idsByCategory.get(svc.categoryId) ?? [];
        arr.push(svc.id);
        idsByCategory.set(svc.categoryId, arr);
      }
    }

    const selectedService = filters?.services?.[0];
    if (selectedService) {
      const serviceId = idsBySlug.get(selectedService) ?? selectedService;
      query = query.eq("partner_services.service_id", serviceId);
    } else if (filters?.category) {
      const categoryServiceIds = idsByCategory.get(filters.category) ?? [];
      if (categoryServiceIds.length === 0) {
        return { items: [], total: 0, page: 1, perPage };
      }
      query = query.in("partner_services.service_id", categoryServiceIds);
    }
  }

  if (filters?.q) {
    const q = filters.q.trim();
    if (q) {
      query = query.textSearch("search_tsv", q, {
        config: "simple",
        type: "websearch"
      });
    }
  }

  if (params.type === "sto" && (filters?.openToday || filters?.openNow)) {
    const dayKey = getWeekdayKey();
    const openPath = `work_hours->${dayKey}->>open`;
    const closePath = `work_hours->${dayKey}->>close`;
    query = query.not(openPath, "is", null).not(closePath, "is", null);
    if (filters.openNow) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const nowText = `${hh}:${mm}`;
      query = query.lte(openPath, nowText).gte(closePath, nowText);
    }
  }

  if (filters?.sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("rating_avg", { ascending: false, nullsFirst: false }).order("rating_count", { ascending: false });
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.warn("Supabase getPartnersByCityPage error", error);
    const all = await getPartnersByCity({
      type: params.type,
      cityId: params.cityId,
      citySlug: params.citySlug,
      filters: params.filters
    });
    return paginateLocal(all, page, perPage);
  }

  const [servicesCatalog, partCategoriesCatalog] = await Promise.all([getServices(), getPartCategories()]);
  const serviceByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const svc of servicesCatalog) {
    serviceByIdOrSlug.set(svc.id, { id: svc.id, name_ua: svc.name_ua });
    serviceByIdOrSlug.set(svc.slug, { id: svc.id, name_ua: svc.name_ua });
  }
  const partCategoryByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const cat of partCategoriesCatalog) {
    partCategoryByIdOrSlug.set(cat.id, { id: cat.id, name_ua: cat.name_ua });
    partCategoryByIdOrSlug.set(cat.slug, { id: cat.id, name_ua: cat.name_ua });
  }

  type RawPartner = Partner & {
    partner_services?: { service_id: string }[];
    shop_part_offers?: { category_id: string; delivery_available?: boolean }[];
    partner_car_compatibility?: { brand_id: string }[];
    parts_sales_enabled?: boolean;
    work_hours?: Partner["workHours"];
    online_booking_enabled?: boolean;
    booking_mode?: Partner["bookingMode"];
    booking_url?: string | null;
    has_tow_service?: boolean;
    mobile_service?: boolean;
  };

  let items: Partner[] = (((data as unknown) as RawPartner[] | null) ?? []).map((p) => ({
    ...p,
    services: p.partner_services?.map((s) => serviceByIdOrSlug.get(s.service_id) || { id: s.service_id, name_ua: s.service_id }),
    categories: p.shop_part_offers?.map(
      (s) => partCategoryByIdOrSlug.get(s.category_id) || { id: s.category_id, name_ua: s.category_id }
    ),
    brands: p.partner_car_compatibility?.map((c) => c.brand_id),
    delivery_available: p.shop_part_offers?.some((o) => o.delivery_available) ?? false,
    partsSalesEnabled: p.parts_sales_enabled ?? (p.shop_part_offers?.length ?? 0) > 0,
    workHours: p.work_hours ?? p.workHours ?? null,
    onlineBookingEnabled: p.online_booking_enabled ?? p.onlineBookingEnabled ?? false,
    bookingMode: p.booking_mode ?? p.bookingMode ?? "none",
    bookingUrl: p.booking_url ?? p.bookingUrl ?? null,
    hasTowService: p.has_tow_service ?? p.hasTowService ?? false,
    mobileService: p.mobile_service ?? p.mobileService ?? false
  }));

  if (filters?.q) {
    items = rerankPartnersByQuery(items, filters.q);
  }

  const total = Number(count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    items,
    total,
    page: Math.min(page, totalPages),
    perPage
  };
}

export async function getRelatedPartnersByCity(params: {
  cityId: string;
  type?: PartnerType;
  excludePartnerId?: string;
  limit?: number;
}): Promise<Partner[]> {
  const { cityId, type = "sto", excludePartnerId, limit = 4 } = params;

  if (!supabaseReady) {
    return (await getPartnersByCity({ type, cityId, filters: { sort: "rating" } }))
      .filter((p) => p.id !== excludePartnerId)
      .slice(0, limit);
  }

  const supabase = getSupabaseServerClient();
  const selectClause =
    "*, partner_services!left(service_id), shop_part_offers!left(category_id, delivery_available), partner_car_compatibility!left(brand_id)";
  let query = supabase
    .from("partners")
    .select(selectClause)
    .eq("type", type)
    .eq("city_id", cityId)
    .eq("status", "active")
    .order("rating_avg", { ascending: false, nullsFirst: false })
    .order("rating_count", { ascending: false })
    .limit(Math.max(1, limit + (excludePartnerId ? 1 : 0)));

  if (excludePartnerId) {
    query = query.neq("id", excludePartnerId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Supabase getRelatedPartnersByCity error", error);
    return (await getPartnersByCity({ type, cityId, filters: { sort: "rating" } }))
      .filter((p) => p.id !== excludePartnerId)
      .slice(0, limit);
  }

  const [servicesCatalog, partCategoriesCatalog] = await Promise.all([getServices(), getPartCategories()]);
  const serviceByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const svc of servicesCatalog) {
    serviceByIdOrSlug.set(svc.id, { id: svc.id, name_ua: svc.name_ua });
    serviceByIdOrSlug.set(svc.slug, { id: svc.id, name_ua: svc.name_ua });
  }
  const partCategoryByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const cat of partCategoriesCatalog) {
    partCategoryByIdOrSlug.set(cat.id, { id: cat.id, name_ua: cat.name_ua });
    partCategoryByIdOrSlug.set(cat.slug, { id: cat.id, name_ua: cat.name_ua });
  }

  type RawPartner = Partner & {
    partner_services?: { service_id: string }[];
    shop_part_offers?: { category_id: string; delivery_available?: boolean }[];
    partner_car_compatibility?: { brand_id: string }[];
    parts_sales_enabled?: boolean;
    work_hours?: Partner["workHours"];
    online_booking_enabled?: boolean;
    booking_mode?: Partner["bookingMode"];
    booking_url?: string | null;
    has_tow_service?: boolean;
    mobile_service?: boolean;
  };

  return ((((data as unknown) as RawPartner[] | null) ?? []).map((p) => ({
    ...p,
    services: p.partner_services?.map((s) => serviceByIdOrSlug.get(s.service_id) || { id: s.service_id, name_ua: s.service_id }),
    categories: p.shop_part_offers?.map(
      (s) => partCategoryByIdOrSlug.get(s.category_id) || { id: s.category_id, name_ua: s.category_id }
    ),
    brands: p.partner_car_compatibility?.map((c) => c.brand_id),
    delivery_available: p.shop_part_offers?.some((o) => o.delivery_available) ?? false,
    partsSalesEnabled: p.parts_sales_enabled ?? (p.shop_part_offers?.length ?? 0) > 0,
    workHours: p.work_hours ?? p.workHours ?? null,
    onlineBookingEnabled: p.online_booking_enabled ?? p.onlineBookingEnabled ?? false,
    bookingMode: p.booking_mode ?? p.bookingMode ?? "none",
    bookingUrl: p.booking_url ?? p.bookingUrl ?? null,
    hasTowService: p.has_tow_service ?? p.hasTowService ?? false,
    mobileService: p.mobile_service ?? p.mobileService ?? false
  })) as Partner[]).slice(0, limit);
}

export async function getPartnersByCity(params: {
  type: PartnerType;
  cityId?: string;
  citySlug?: string;
  filters?: PartnerFilters;
}): Promise<Partner[]> {
  const { type, cityId, citySlug, filters } = params;
  const fallback = () => {
    const city = cityId ? demoCities.find((c) => c.id === cityId) : demoCities.find((c) => c.slug === citySlug);
    let list = allDemoPartners.filter((p) => p.type === type && p.city_id === city?.id && p.status === "active");
    if (filters?.services?.length && type === "sto") {
      list = list.filter((p) =>
        filters.services!.every((s) =>
          p.services?.some((ps) => {
            const key = typeof ps === "string" ? ps : ps.id;
            return key === s;
          })
        )
      );
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((p) => {
        const serviceText = (p.services ?? [])
          .map((s) => (typeof s === "string" ? s : s.name_ua || s.id))
          .join(" ")
          .toLowerCase();
        const hay = [p.name, p.description ?? "", p.address ?? "", p.district ?? "", serviceText].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    if (filters?.category && type === "sto") {
      list = list.filter((p) =>
        p.services?.some((s) => {
          const key = typeof s === "string" ? s : s.id;
          const svc = demoServices.find((item) => item.id === key || item.slug === key);
          return svc?.categoryId === filters.category;
        })
      );
    }
    if (filters?.categories?.length && type === "shop") {
      list = list.filter((p) =>
        filters.categories!.some((c) =>
          p.categories?.some((pc) => {
            const key = typeof pc === "string" ? pc : pc.id;
            return key === c;
          })
        )
      );
    }
    if (filters?.brand) {
      list = list.filter((p) => !p.brands || p.brands.includes(filters.brand!));
    }
    if (filters?.verified) {
      list = list.filter((p) => p.verified);
    }
    if (filters?.delivery && type === "shop") {
      list = list.filter((p) => p.delivery_available);
    }
    if (filters?.partsSalesEnabled && type === "sto") {
      list = list.filter((p) => p.partsSalesEnabled || p.delivery_available || Boolean(p.categories?.length));
    }
    if (filters?.onlineBooking && type === "sto") {
      list = list.filter((p) => p.onlineBookingEnabled);
    }
    if (filters?.openToday && type === "sto") {
      list = list.filter(isOpenToday);
    }
    if (filters?.openNow && type === "sto") {
      list = list.filter(isOpenNow);
    }
    if (filters?.hasTowService && type === "sto") {
      list = list.filter((p) => p.hasTowService);
    }
    if (filters?.mobileService && type === "sto") {
      list = list.filter((p) => p.mobileService);
    }
    if (filters?.evacOrMobile && type === "sto") {
      list = list.filter((p) => p.hasTowService || p.mobileService);
    }
    if (filters?.sort === "rating") {
      list = sortPartnersByRatingConfidence(list);
    }
    return list;
  };

  if (!supabaseReady) {
    return fallback();
  }

  const supabase = getSupabaseServerClient();
  const city = cityId
    ? { id: cityId }
    : citySlug
      ? await getCityBySlug(citySlug)
      : null;
  if (!city) return fallback();

  const selectClause =
    "*, partner_services(service_id), shop_part_offers(category_id, delivery_available), partner_car_compatibility(brand_id)";
  const pageSize = 1000;
  let from = 0;
  const rawRows: unknown[] = [];
  let fetchError: unknown = null;

  while (true) {
    const { data, error } = await supabase
      .from("partners")
      .select(selectClause)
      .eq("type", type)
      .eq("city_id", city.id)
      .eq("status", "active")
      .range(from, from + pageSize - 1);

    if (error) {
      fetchError = error;
      break;
    }

    rawRows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  if (fetchError) {
    console.warn("Supabase getPartnersByCity error", fetchError);
    return fallback();
  }

  const [servicesCatalog, partCategoriesCatalog] = await Promise.all([getServices(), getPartCategories()]);
  const serviceByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  const serviceCategoryByIdOrSlug = new Map<string, string | null>();
  for (const svc of servicesCatalog) {
    serviceByIdOrSlug.set(svc.id, { id: svc.id, name_ua: svc.name_ua });
    serviceByIdOrSlug.set(svc.slug, { id: svc.id, name_ua: svc.name_ua });
    serviceCategoryByIdOrSlug.set(svc.id, svc.categoryId ?? null);
    serviceCategoryByIdOrSlug.set(svc.slug, svc.categoryId ?? null);
  }
  const partCategoryByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const cat of partCategoriesCatalog) {
    partCategoryByIdOrSlug.set(cat.id, { id: cat.id, name_ua: cat.name_ua });
    partCategoryByIdOrSlug.set(cat.slug, { id: cat.id, name_ua: cat.name_ua });
  }

  type RawPartner = Partner & {
    partner_services?: { service_id: string }[];
    shop_part_offers?: { category_id: string; delivery_available?: boolean }[];
    partner_car_compatibility?: { brand_id: string }[];
    parts_sales_enabled?: boolean;
    work_hours?: Partner["workHours"];
    online_booking_enabled?: boolean;
    booking_mode?: Partner["bookingMode"];
    booking_url?: string | null;
    has_tow_service?: boolean;
    mobile_service?: boolean;
  };

  let partners: Partner[] =
    (rawRows as RawPartner[]).map((p) => ({
      ...p,
      services: p.partner_services?.map(
        (s) => serviceByIdOrSlug.get(s.service_id) || { id: s.service_id, name_ua: s.service_id }
      ),
      categories: p.shop_part_offers?.map(
        (s) => partCategoryByIdOrSlug.get(s.category_id) || { id: s.category_id, name_ua: s.category_id }
      ),
      brands: p.partner_car_compatibility?.map((c) => c.brand_id),
      delivery_available: p.shop_part_offers?.some((o) => o.delivery_available) ?? false,
      partsSalesEnabled: p.parts_sales_enabled ?? (p.shop_part_offers?.length ?? 0) > 0,
      workHours: p.work_hours ?? p.workHours ?? null,
      onlineBookingEnabled: p.online_booking_enabled ?? p.onlineBookingEnabled ?? false,
      bookingMode: p.booking_mode ?? p.bookingMode ?? "none",
      bookingUrl: p.booking_url ?? p.bookingUrl ?? null,
      hasTowService: p.has_tow_service ?? p.hasTowService ?? false,
      mobileService: p.mobile_service ?? p.mobileService ?? false
    })) ?? [];

  if (filters?.services?.length && type === "sto") {
    partners = partners.filter((p) =>
      filters.services!.every((s) =>
        p.services?.some((ps) => {
          const key = typeof ps === "string" ? ps : ps.id;
          return key === s;
        })
      )
    );
  }
  if (filters?.categories?.length && type === "shop") {
    partners = partners.filter((p) =>
      filters.categories!.some((c) =>
        p.categories?.some((pc) => {
          const key = typeof pc === "string" ? pc : pc.id;
          return key === c;
        })
      )
    );
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    partners = partners.filter((p) => {
      const serviceText = (p.services ?? [])
        .map((s) => (typeof s === "string" ? s : s.name_ua || s.id))
        .join(" ")
        .toLowerCase();
      const hay = [p.name, p.description ?? "", p.address ?? "", p.district ?? "", serviceText].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  if (filters?.category && type === "sto") {
    partners = partners.filter((p) =>
      p.services?.some((s) => {
        const key = typeof s === "string" ? s : s.id;
        return serviceCategoryByIdOrSlug.get(key) === filters.category;
      })
    );
  }
  if (filters?.brand) {
    partners = partners.filter((p) => !p.brands || p.brands.includes(filters.brand!));
  }
  if (filters?.verified) {
    partners = partners.filter((p) => p.verified);
  }
  if (filters?.delivery && type === "shop") {
    partners = partners.filter((p) => p.delivery_available);
  }
  if (filters?.partsSalesEnabled && type === "sto") {
    partners = partners.filter((p) => p.partsSalesEnabled || p.delivery_available || Boolean(p.categories?.length));
  }
  if (filters?.onlineBooking && type === "sto") {
    partners = partners.filter((p) => p.onlineBookingEnabled);
  }
  if (filters?.openToday && type === "sto") {
    partners = partners.filter(isOpenToday);
  }
  if (filters?.openNow && type === "sto") {
    partners = partners.filter(isOpenNow);
  }
  if (filters?.hasTowService && type === "sto") {
    partners = partners.filter((p) => p.hasTowService);
  }
  if (filters?.mobileService && type === "sto") {
    partners = partners.filter((p) => p.mobileService);
  }
  if (filters?.evacOrMobile && type === "sto") {
    partners = partners.filter((p) => p.hasTowService || p.mobileService);
  }
  if (filters?.sort === "rating") {
    partners = sortPartnersByRatingConfidence(partners);
  }

  return partners;
}

export async function getPartnerBySlug(type: PartnerType, slug: string): Promise<Partner | null> {
  if (!supabaseReady) {
    const p = allDemoPartners.find((x) => x.slug === slug && x.type === type);
    if (!p) return null;
    return {
      ...p,
      services: p.services?.map((s) =>
        typeof s === "string"
          ? demoServices.find((svc) => svc.slug === s || svc.id === s) || { id: s, name_ua: s }
          : { id: s.id, name_ua: s.name_ua }
      ),
      categories: p.categories?.map((c) =>
        typeof c === "string"
          ? demoPartCategories.find((cat) => cat.slug === c || cat.id === c) || { id: c, name_ua: c }
          : { id: c.id, name_ua: c.name_ua }
      )
    };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("partners")
    .select(
      "*, partner_services(service_id), shop_part_offers(category_id, delivery_available), partner_car_compatibility(brand_id)"
    )
    .eq("slug", slug)
    .eq("type", type)
    .eq("status", "active")
    .single();

  if (error) {
    console.warn("Supabase getPartnerBySlug error", error);
    const p = allDemoPartners.find((x) => x.slug === slug && x.type === type);
    if (!p) return null;
    return {
      ...p,
      services: p.services?.map((s) =>
        typeof s === "string"
          ? demoServices.find((svc) => svc.slug === s || svc.id === s) || { id: s, name_ua: s }
          : { id: s.id, name_ua: s.name_ua }
      ),
      categories: p.categories?.map((c) =>
        typeof c === "string"
          ? demoPartCategories.find((cat) => cat.slug === c || cat.id === c) || { id: c, name_ua: c }
          : { id: c.id, name_ua: c.name_ua }
      )
    };
  }
  const [servicesCatalog, partCategoriesCatalog] = await Promise.all([getServices(), getPartCategories()]);
  const serviceByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const svc of servicesCatalog) {
    serviceByIdOrSlug.set(svc.id, { id: svc.id, name_ua: svc.name_ua });
    serviceByIdOrSlug.set(svc.slug, { id: svc.id, name_ua: svc.name_ua });
  }
  const partCategoryByIdOrSlug = new Map<string, { id: string; name_ua: string }>();
  for (const cat of partCategoriesCatalog) {
    partCategoryByIdOrSlug.set(cat.id, { id: cat.id, name_ua: cat.name_ua });
    partCategoryByIdOrSlug.set(cat.slug, { id: cat.id, name_ua: cat.name_ua });
  }
  return {
    ...data,
    services: data.partner_services
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((s: any) => serviceByIdOrSlug.get(s.service_id) || { id: s.service_id, name_ua: s.service_id }),
    categories: data.shop_part_offers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((s: any) => partCategoryByIdOrSlug.get(s.category_id) || { id: s.category_id, name_ua: s.category_id }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delivery_available: data.shop_part_offers?.some((s: any) => s.delivery_available) ?? false,
    partsSalesEnabled: data.parts_sales_enabled ?? (data.shop_part_offers?.length ?? 0) > 0,
    workHours: data.work_hours ?? data.workHours ?? null,
    onlineBookingEnabled: data.online_booking_enabled ?? data.onlineBookingEnabled ?? false,
    bookingMode: data.booking_mode ?? data.bookingMode ?? "none",
    bookingUrl: data.booking_url ?? data.bookingUrl ?? null,
    hasTowService: data.has_tow_service ?? data.hasTowService ?? false,
    mobileService: data.mobile_service ?? data.mobileService ?? false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    brands: data.partner_car_compatibility?.map((c: any) => c.brand_id)
  };
}

export async function getServices(): Promise<Service[]> {
  if (!supabaseReady) return demoServices;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("name_ua");
  if (error) {
    console.warn("Supabase getServices error", error);
    return demoServices;
  }
  const dbServices = (data as Service[] | null) ?? [];
  const merged = new Map<string, Service>();

  for (const item of demoServices) {
    merged.set(item.slug, item);
  }

  for (const item of dbServices) {
    const taxonomy = taxonomyServicesBySlug.get(item.slug);
    merged.set(item.slug, {
      ...taxonomy,
      ...item,
      categoryId: item.categoryId ?? taxonomy?.categoryId ?? null,
      keywords: item.keywords ?? taxonomy?.keywords ?? [],
      isPopular: item.isPopular ?? taxonomy?.isPopular ?? false,
      sortOrder: item.sortOrder ?? taxonomy?.sortOrder ?? 0
    });
  }

  return Array.from(merged.values()).sort((a, b) => {
    const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (byOrder !== 0) return byOrder;
    return a.name_ua.localeCompare(b.name_ua, "uk");
  });
}

export async function getPartCategories(): Promise<PartCategory[]> {
  if (!supabaseReady) return demoPartCategories;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("part_categories").select("*").eq("is_active", true).order("name_ua");
  if (error) {
    console.warn("Supabase getPartCategories error", error);
    return demoPartCategories;
  }
  return data ?? demoPartCategories;
}

export async function getBrands(): Promise<CarBrand[]> {
  if (!supabaseReady) return demoBrands;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("car_brands").select("*").order("name");
  if (error) {
    console.warn("Supabase getBrands error", error);
    return demoBrands;
  }
  return data ?? demoBrands;
}

export async function getModelsByBrand(brandId: string): Promise<CarModel[]> {
  if (!supabaseReady) return [];
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("car_models").select("*").eq("brand_id", brandId).order("name");
  if (error) {
    console.warn("Supabase getModelsByBrand error", error);
    return [];
  }
  return (data as CarModel[]) ?? [];
}

// --- Offers & Orders ---

export async function getOffersByRequest(requestId: string) {
  if (!supabaseReady) return [];
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("offers").select("*").eq("request_id", requestId);
  if (error) {
    console.warn("Supabase getOffersByRequest error", error);
    return [];
  }
  return data ?? [];
}

export async function createOffer(payload: {
  request_id: string;
  partner_id: string;
  price?: number;
  eta_days?: number;
  note?: string;
}) {
  if (!supabaseReady) {
    console.log("Mock createOffer", payload);
    return { ok: true };
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("offers").insert({
    ...payload,
    status: "sent"
  });
  if (error) {
    console.warn("Supabase createOffer error", error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function selectOffer(offerId: string) {
  if (!supabaseReady) {
    console.log("Mock selectOffer", offerId);
    return { ok: true };
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
  if (error) {
    console.warn("Supabase selectOffer error", error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!supabaseReady) {
    console.log("Mock updateOrderStatus", orderId, status);
    return { ok: true };
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    console.warn("Supabase updateOrderStatus error", error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function createRequestRepair(payload: RepairRequestPayload) {
  if (!supabaseReady) {
    console.log("Mock create repair request", payload);
    return { ok: true };
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("requests").insert({
    type: "repair",
    city_id: payload.city_id,
    car_brand_id: payload.car_brand_id,
    car_model_id: payload.car_model_id,
    car_year: payload.car_year,
    problem_description: payload.problem_description,
    parts_needed: payload.parts_needed ?? false,
    photos: payload.photos ?? [],
    contact_phone: payload.contact_phone,
    contact_name: payload.contact_name,
    status: "new"
  });
  if (error) throw error;
  return { ok: true };
}

export async function createRequestParts(payload: PartsRequestPayload) {
  if (!supabaseReady) {
    console.log("Mock create parts request", payload);
    return { ok: true };
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("requests").insert({
    type: "parts",
    city_id: payload.city_id,
    car_brand_id: payload.car_brand_id,
    car_model_id: payload.car_model_id,
    car_year: payload.car_year,
    part_category_id: payload.part_category_id,
    part_query: payload.part_query,
    contact_phone: payload.contact_phone,
    contact_name: payload.contact_name,
    status: "new"
  });
  if (error) throw error;
  return { ok: true };
}
