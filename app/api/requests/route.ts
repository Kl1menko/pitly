import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { repairRequestSchema, partsRequestSchema } from "@/lib/validators/requests";

function decodeCookieValue(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractAccessToken(req: NextRequest) {
  const direct = decodeCookieValue(req.cookies.get("sb-access-token")?.value);
  if (direct) return direct;
  const legacy = decodeCookieValue(req.cookies.get("sb:token")?.value);
  if (!legacy) return "";
  try {
    const parsed = JSON.parse(legacy);
    if (typeof parsed?.access_token === "string") return parsed.access_token;
  } catch {
    return legacy;
  }
  return "";
}

function makeRequestProof(requestId: string, contactPhone: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(`${requestId}:${contactPhone.trim()}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body?.type;
    if (type !== "repair" && type !== "parts") {
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();
    const accessToken = extractAccessToken(req);
    let authenticatedUserId: string | null = null;
    if (accessToken) {
      const { data } = await supabase.auth.getUser(accessToken);
      authenticatedUserId = data.user?.id ?? null;
    }

    if (type === "repair") {
      const parsed = repairRequestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "validation_error",
            details: parsed.error.issues.map((issue) => issue.message)
          },
          { status: 400 }
        );
      }

      const payloadIn = parsed.data;
      const payload = {
        type,
        city_id: payloadIn.city_id,
        car_brand_id: payloadIn.car_brand_id || null,
        car_model_id: payloadIn.car_model_id || null,
        car_model_name: payloadIn.car_model_name || null,
        car_year: payloadIn.car_year || null,
        vin: null,
        contact_phone: payloadIn.contact_phone,
        contact_name: payloadIn.contact_name || null,
        target_partner_id: payloadIn.target_partner_id || null,
        status: "new" as const,
        client_profile_id: authenticatedUserId,
        parts_needed: Boolean(payloadIn.parts_needed),
        problem_description: payloadIn.problem_description || null,
        photos: Array.isArray(payloadIn.photos) ? payloadIn.photos : [],
        service_id: payloadIn.services_multi?.[0] ?? null,
        extra_services: payloadIn.services_multi?.slice(1) ?? []
      };

      const { data, error } = await supabase
        .from("requests")
        .insert(payload)
        .select("id, contact_phone")
        .single();
      if (error) {
        console.error("create request error", error);
        return NextResponse.json({ error: "db_error", details: error.message }, { status: 500 });
      }

      const requestProof = data?.id && data?.contact_phone ? makeRequestProof(data.id, data.contact_phone) : null;
      return NextResponse.json({ ok: true, id: data?.id, requestProof });
    }

    const parsed = partsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          details: parsed.error.issues.map((issue) => issue.message)
        },
        { status: 400 }
      );
    }
    const payloadIn = parsed.data;
    const payload = {
      type,
      city_id: payloadIn.city_id,
      car_brand_id: payloadIn.car_brand_id || null,
      car_model_id: payloadIn.car_model_id || null,
      car_model_name: payloadIn.car_model_name || null,
      car_year: payloadIn.car_year || null,
      vin: payloadIn.vin?.trim().toUpperCase() || null,
      contact_phone: payloadIn.contact_phone,
      contact_name: payloadIn.contact_name || null,
      target_partner_id: payloadIn.target_partner_id || null,
      status: "new" as const,
      client_profile_id: authenticatedUserId,
      parts_needed: false,
      part_category_id: payloadIn.part_categories?.[0] ?? null,
      extra_part_categories: payloadIn.part_categories?.slice(1) ?? [],
      part_query: payloadIn.part_query,
      preferred_time: null
    };

    const { data, error } = await supabase
      .from("requests")
      .insert(payload)
      .select("id, contact_phone")
      .single();
    if (error) {
      console.error("create request error", error);
      return NextResponse.json({ error: "db_error", details: error.message }, { status: 500 });
    }

    const requestProof = data?.id && data?.contact_phone ? makeRequestProof(data.id, data.contact_phone) : null;
    return NextResponse.json({ ok: true, id: data?.id, requestProof });
  } catch (e: unknown) {
    console.error("request API error", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
