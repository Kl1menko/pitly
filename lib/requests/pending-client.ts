'use client';

const PENDING_REQUEST_KEY = "pitly_pending_request";

type PendingRequest =
  | {
      type: "repair";
      values: {
        city_id: string;
        car_brand_id?: string | null;
        car_model_id?: string | null;
        car_model_name?: string | null;
        car_year?: number | null;
        problem_description?: string | null;
        parts_needed?: boolean;
        contact_phone: string;
        contact_name?: string | null;
        contact_telegram?: string | null;
        target_partner_id?: string | null;
        services_multi?: string[];
      };
    }
  | {
      type: "parts";
      values: {
        city_id: string;
        car_brand_id?: string | null;
        car_model_id?: string | null;
        car_model_name?: string | null;
        car_year?: number | null;
        vin?: string | null;
        part_categories?: string[];
        part_query: string;
        contact_phone: string;
        contact_name?: string | null;
        contact_telegram?: string | null;
        target_partner_id?: string | null;
      };
    };

function readPendingRequest(): PendingRequest | null {
  const raw = localStorage.getItem(PENDING_REQUEST_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || (parsed.type !== "repair" && parsed.type !== "parts") || !parsed.values) {
      localStorage.removeItem(PENDING_REQUEST_KEY);
      return null;
    }
    return parsed as PendingRequest;
  } catch {
    localStorage.removeItem(PENDING_REQUEST_KEY);
    return null;
  }
}

export function savePendingRequest(payload: PendingRequest) {
  localStorage.setItem(PENDING_REQUEST_KEY, JSON.stringify(payload));
}

export function clearPendingRequest() {
  localStorage.removeItem(PENDING_REQUEST_KEY);
}

export async function submitPendingRequestIfAny(): Promise<{ submitted: boolean; requestId?: string }> {
  const pending = readPendingRequest();
  if (!pending) return { submitted: false };

  const body =
    pending.type === "repair"
      ? {
          type: "repair" as const,
          city_id: pending.values.city_id,
          car_brand_id: pending.values.car_brand_id || null,
          car_model_id: pending.values.car_model_id || null,
          car_model_name: pending.values.car_model_name || null,
          car_year: pending.values.car_year || null,
          problem_description: pending.values.problem_description || null,
          parts_needed: Boolean(pending.values.parts_needed),
          photos: [],
          contact_phone: pending.values.contact_phone,
          contact_name: pending.values.contact_name || null,
          target_partner_id: pending.values.target_partner_id || null,
          services_multi: pending.values.services_multi ?? []
        }
      : {
          type: "parts" as const,
          city_id: pending.values.city_id,
          car_brand_id: pending.values.car_brand_id || null,
          car_model_id: pending.values.car_model_id || null,
          car_model_name: pending.values.car_model_name || null,
          car_year: pending.values.car_year || null,
          vin: pending.values.vin?.trim().toUpperCase() || null,
          part_categories: pending.values.part_categories ?? [],
          part_query: pending.values.part_query,
          contact_phone: pending.values.contact_phone,
          contact_name: pending.values.contact_name || null,
          target_partner_id: pending.values.target_partner_id || null
        };

  const res = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "pending_request_failed");
  }

  const requestId = typeof data?.id === "string" ? data.id : undefined;
  const requestProof = typeof data?.requestProof === "string" ? data.requestProof : undefined;
  const telegram = pending.values.contact_telegram?.trim();
  if (requestId && telegram) {
    await fetch("/api/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, telegram, requestProof })
    }).catch(() => null);
  }

  clearPendingRequest();
  return { submitted: true, requestId };
}
