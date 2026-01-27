import { demoBrands, demoCities, demoPartCategories, demoPartners, demoServices } from "@/lib/data/demo";
import { supabaseReady, getSupabaseServerClient } from "@/lib/supabase/server";
import {
  type Partner,
  type PartnerType,
  type RepairRequestPayload,
  type PartsRequestPayload,
  type City,
  type Service,
  type PartCategory,
  type CarBrand
} from "@/lib/types";

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
  services?: string[];
  brand?: string;
  categories?: string[];
  verified?: boolean;
  delivery?: boolean;
  sort?: "rating" | "new";
};

export async function getPartnersByCity(params: {
  type: PartnerType;
  cityId?: string;
  citySlug?: string;
  filters?: PartnerFilters;
}): Promise<Partner[]> {
  const { type, cityId, citySlug, filters } = params;
  if (!supabaseReady) {
    const city = cityId ? demoCities.find((c) => c.id === cityId) : demoCities.find((c) => c.slug === citySlug);
    let list = demoPartners.filter((p) => p.type === type && p.city_id === city?.id && p.status === "active");
    if (filters?.services?.length && type === "sto") {
      list = list.filter((p) => filters.services!.every((s) => p.services?.includes(s)));
    }
    if (filters?.categories?.length && type === "shop") {
      list = list.filter((p) => filters.categories!.some((c) => p.categories?.includes(c)));
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
    if (filters?.sort === "rating") {
      list = [...list].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
    }
    return list;
  }

  const supabase = getSupabaseServerClient();
  const city = cityId
    ? { id: cityId }
    : citySlug
      ? await getCityBySlug(citySlug)
      : null;
  if (!city) return [];

  const { data, error } = await supabase
    .from("partners")
    .select(
      "*, partner_services(service_id), shop_part_offers(category_id, delivery_available), partner_car_compatibility(brand_id)"
    )
    .eq("type", type)
    .eq("city_id", city.id)
    .eq("status", "active");

  if (error) {
    console.warn("Supabase getPartnersByCity error", error);
    return [];
  }

  type RawPartner = Partner & {
    partner_services?: { service_id: string }[];
    shop_part_offers?: { category_id: string; delivery_available?: boolean }[];
    partner_car_compatibility?: { brand_id: string }[];
  };

  let partners: Partner[] =
    (data as RawPartner[] | null)?.map((p) => ({
      ...p,
      services: p.partner_services?.map(
        (s) => demoServices.find((svc) => svc.id === s.service_id || svc.slug === s.service_id) || { id: s.service_id, name_ua: s.service_id }
      ),
      categories: p.shop_part_offers?.map(
        (s) => demoPartCategories.find((cat) => cat.id === s.category_id || cat.slug === s.category_id) || { id: s.category_id, name_ua: s.category_id }
      ),
      brands: p.partner_car_compatibility?.map((c) => c.brand_id),
      delivery_available: p.shop_part_offers?.some((o) => o.delivery_available) ?? false
    })) ?? [];

  if (filters?.services?.length && type === "sto") {
    partners = partners.filter((p) => filters.services!.every((s) => p.services?.includes(s)));
  }
  if (filters?.categories?.length && type === "shop") {
    partners = partners.filter((p) => filters.categories!.some((c) => p.categories?.includes(c)));
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
  if (filters?.sort === "rating") {
    partners = [...partners].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
  }

  return partners;
}

export async function getPartnerBySlug(type: PartnerType, slug: string): Promise<Partner | null> {
  if (!supabaseReady) {
    const p = demoPartners.find((x) => x.slug === slug && x.type === type);
    if (!p) return null;
    return {
      ...p,
      services: p.services?.map((s) => demoServices.find((svc) => svc.slug === s) || { id: s, name_ua: s }),
      categories: p.categories?.map((c) => demoPartCategories.find((cat) => cat.slug === c) || { id: c, name_ua: c })
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
    return null;
  }
  return {
    ...data,
    services: data.partner_services
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((s: any) => demoServices.find((svc) => svc.id === s.service_id) || { id: s.service_id, name_ua: s.service_id }),
    categories: data.shop_part_offers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((s: any) => demoPartCategories.find((cat) => cat.id === s.category_id) || { id: s.category_id, name_ua: s.category_id }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delivery_available: data.shop_part_offers?.some((s: any) => s.delivery_available) ?? false,
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
  return data ?? demoServices;
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
