export type PartnerType = "sto" | "shop";
export type BookingMode = "none" | "phone" | "messenger" | "external";

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DaySchedule = {
  open?: string | null; // HH:mm
  close?: string | null; // HH:mm
  isOpen?: boolean;
};
export type WorkHours = Partial<Record<WeekdayKey, DaySchedule>>;

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  short?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

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
  categoryId?: string | null;
  keywords?: string[];
  isPopular?: boolean;
  sortOrder?: number | null;
}

export interface StationService {
  stationId: string;
  serviceId: string;
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

export interface CarModel {
  id: string;
  brand_id: string;
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
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  description?: string | null;
  workHours?: WorkHours | null;
  verified?: boolean;
  status?: "pending" | "active" | "blocked";
  rating_avg?: number | null;
  rating_count?: number | null;
  services?: { id: string; name_ua: string }[];
  categories?: { id: string; name_ua: string }[];
  brands?: string[];
  delivery_available?: boolean;
  partsSalesEnabled?: boolean;
  onlineBookingEnabled?: boolean;
  bookingMode?: BookingMode;
  bookingUrl?: string | null;
  hasTowService?: boolean;
  mobileService?: boolean;
}

export interface RequestPayloadBase {
  city_id: string;
  contact_phone: string;
  contact_name?: string | null;
  car_brand_id?: string | null;
  car_model_id?: string | null;
  car_model_name?: string | null;
  car_year?: number | null;
  vin?: string | null;
}

export interface RepairRequestPayload extends RequestPayloadBase {
  type: "repair";
  problem_description?: string | null;
  service_id?: string | null;
  extra_services?: string[] | null;
  photos?: string[];
  parts_needed?: boolean;
}

export interface PartsRequestPayload extends RequestPayloadBase {
  type: "parts";
  part_category_id: string;
  extra_part_categories?: string[] | null;
  part_query: string;
  delivery_needed?: boolean;
}

export type OfferStatus = "sent" | "viewed" | "accepted" | "rejected" | "expired";
export interface Offer {
  id: string;
  request_id: string;
  partner_id: string;
  price?: number | null;
  eta_days?: number | null;
  note?: string | null;
  status: OfferStatus;
  created_at?: string;
}

export type OrderStatus =
  | "created"
  | "confirmed"
  | "in_progress"
  | "fulfilled"
  | "closed"
  | "cancelled"
  | "refund_requested"
  | "refunded";

export interface Order {
  id: string;
  request_id: string;
  offer_id: string;
  client_id: string;
  partner_id: string;
  status: OrderStatus;
  scheduled_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
}

export interface ClientCar {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  vin?: string | null;
  notes?: string | null;
  mileage_km?: number | null;
  last_service?: string | null;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  attachments?: unknown[];
  created_at?: string;
}

export interface Complaint {
  id: string;
  actor_profile_id: string;
  target_partner_id?: string | null;
  request_id?: string | null;
  order_id?: string | null;
  complaint_type: string;
  message: string;
  status: "new" | "in_review" | "resolved" | "rejected";
  created_at?: string;
}
