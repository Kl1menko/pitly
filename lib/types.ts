export type PartnerType = "sto" | "shop";

export interface City {
  id: string;
  name_ua: string;
  slug: string;
  region_ua?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface Service {
  id: string;
  name_ua: string;
  slug: string;
  category?: string | null;
}

export interface PartCategory {
  id: string;
  name_ua: string;
  slug: string;
}

export interface CarBrand {
  id: string;
  name: string;
  slug: string;
}

export interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  slug: string;
  city_id: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  description?: string | null;
  verified?: boolean;
  status?: "pending" | "active" | "blocked";
  rating_avg?: number | null;
  services?: { id: string; name_ua: string }[];
  categories?: { id: string; name_ua: string }[];
  brands?: string[];
  delivery_available?: boolean;
}

export interface RequestPayloadBase {
  city_id: string;
  contact_phone: string;
  contact_name?: string | null;
  car_brand_id?: string | null;
  car_model_id?: string | null;
  car_year?: number | null;
}

export interface RepairRequestPayload extends RequestPayloadBase {
  type: "repair";
  problem_description?: string | null;
  service_id?: string | null;
  photos?: string[];
}

export interface PartsRequestPayload extends RequestPayloadBase {
  type: "parts";
  part_category_id: string;
  part_query: string;
  delivery_needed?: boolean;
}
