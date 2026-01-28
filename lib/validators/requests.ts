import { z } from "zod";

export const repairRequestSchema = z.object({
  city_id: z.string().min(1, "Оберіть місто"),
  car_brand_id: z.string().optional(),
  car_model_id: z.string().optional(),
  car_year: z.coerce.number().int().min(1980).max(new Date().getFullYear()).optional().or(z.nan().transform(() => undefined)),
  service_id: z.string().optional(),
  problem_description: z.string().min(10, "Опишіть проблему детальніше").max(1000),
  photos: z.any().optional(),
  target_partner_id: z.string().optional(),
  contact_phone: z.string().min(6, "Вкажіть телефон"),
  contact_name: z.string().optional()
});

export const partsRequestSchema = z.object({
  city_id: z.string().min(1, "Оберіть місто"),
  car_brand_id: z.string().optional(),
  car_model_id: z.string().optional(),
  car_year: z.coerce.number().int().min(1980).max(new Date().getFullYear()).optional().or(z.nan().transform(() => undefined)),
  part_category_id: z.string().min(1, "Оберіть категорію"),
  part_query: z.string().min(3, "Деталі про запчастину"),
  delivery_needed: z.boolean().optional(),
  target_partner_id: z.string().optional(),
  contact_phone: z.string().min(6, "Вкажіть телефон"),
  contact_name: z.string().optional()
});
