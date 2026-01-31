import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body?.type;
    if (type !== "repair" && type !== "parts") {
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();

    const basePayload = {
      type,
      city_id: body.city_id,
      car_brand_id: body.car_brand_id || null,
      car_model_id: body.car_model_id || null,
      car_model_name: body.car_model_name || null,
      car_year: body.car_year || null,
      vin: body.vin?.trim().toUpperCase() || null,
      contact_phone: body.contact_phone,
      contact_name: body.contact_name || null,
      target_partner_id: body.target_partner_id || null,
      status: "new" as const,
      client_profile_id: body.client_profile_id || null
    };

    const payload =
      type === "repair"
        ? {
            ...basePayload,
            problem_description: body.problem_description || null,
            photos: body.photos ?? [],
            service_id: body.services_multi?.[0] ?? null,
            extra_services: body.services_multi?.slice(1) ?? []
          }
        : {
            ...basePayload,
            part_category_id: body.part_categories?.[0] ?? body.part_category_id ?? null,
            extra_part_categories: body.part_categories?.slice(1) ?? body.extra_part_categories ?? [],
            part_query: body.part_query,
            preferred_time: body.preferred_time || null
          };

    const { data, error } = await supabase.from("requests").insert(payload).select("id").single();
    if (error) {
      console.error("create request error", error);
      return NextResponse.json({ error: "db_error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: unknown) {
    console.error("request API error", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
