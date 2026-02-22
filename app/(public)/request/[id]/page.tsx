import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
  searchParams?: { token?: string | string[] };
};

type RequestRow = {
  id: string;
  type: "repair" | "parts";
  status: string;
  problem_description?: string | null;
  part_query?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  car_model_name?: string | null;
  car_year?: number | null;
  created_at?: string | null;
};

type OfferRow = {
  id: string;
  partner_id: string;
  price?: number | null;
  eta_days?: number | null;
  note?: string | null;
  status: string;
  created_at?: string | null;
};

type PartnerRow = {
  id: string;
  name: string;
  type: "sto" | "shop";
  phone?: string | null;
};

function normalizeToken(token?: string | string[]) {
  if (!token) return "";
  return Array.isArray(token) ? token[0] ?? "" : token;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("uk-UA");
}

export default async function GuestRequestPage({ params, searchParams }: PageProps) {
  const token = normalizeToken(searchParams?.token).trim();
  if (!token) notFound();

  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card className="rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-neutral-900">Посилання тимчасово недоступне</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Сервер не налаштований для перевірки гостьових посилань (немає service role ключа).
          </p>
        </Card>
      </div>
    );
  }

  const nowIso = new Date().toISOString();
  const { data: linkRow, error: linkError } = await supabase
    .from("request_links")
    .select("request_id, expires_at")
    .eq("request_id", params.id)
    .eq("token", token)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (linkError || !linkRow) {
    notFound();
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("requests")
    .select("id,type,status,problem_description,part_query,contact_name,contact_phone,car_model_name,car_year,created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (requestError || !requestRow) {
    notFound();
  }

  const { data: offersData } = await supabase
    .from("offers")
    .select("id,partner_id,price,eta_days,note,status,created_at")
    .eq("request_id", params.id)
    .order("created_at", { ascending: false });

  const offers = (offersData ?? []) as OfferRow[];
  const partnerIds = [...new Set(offers.map((offer) => offer.partner_id).filter(Boolean))];
  let partnersById = new Map<string, PartnerRow>();

  if (partnerIds.length > 0) {
    const { data: partnersData } = await supabase.from("partners").select("id,name,type,phone").in("id", partnerIds);
    partnersById = new Map(((partnersData ?? []) as PartnerRow[]).map((partner) => [partner.id, partner]));
  }

  const request = requestRow as RequestRow;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">Гостьовий доступ до заявки</p>
          <h1 className="text-2xl font-bold text-neutral-900">Заявка #{request.id.slice(0, 8)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-neutral-100 text-neutral-800">
            {request.type === "repair" ? "Ремонт" : "Запчастини"}
          </Badge>
          <Badge className="rounded-full bg-neutral-100 text-neutral-800">{request.status}</Badge>
        </div>
      </div>

      <Card className="rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Деталі заявки</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Створено" value={formatDate(request.created_at)} />
          <InfoRow label="Термін дії посилання" value={formatDate(linkRow.expires_at)} />
          <InfoRow label="Ім'я" value={request.contact_name || "—"} />
          <InfoRow label="Телефон" value={request.contact_phone || "—"} />
          <InfoRow label="Модель" value={request.car_model_name || "—"} />
          <InfoRow label="Рік" value={request.car_year ? String(request.car_year) : "—"} />
        </div>
        <div className="mt-4 rounded-xl bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-700">
            {request.type === "repair" ? "Опис проблеми" : "Що потрібно"}
          </p>
          <p className="mt-1 text-sm text-neutral-900">
            {request.problem_description || request.part_query || "Опис відсутній"}
          </p>
        </div>
      </Card>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">Пропозиції ({offers.length})</h2>
          <Link href="/register" className="text-sm font-medium text-neutral-700 underline underline-offset-4">
            Зареєструватись для повного доступу
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {offers.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-600">
              Пропозицій ще немає. Поверніться пізніше за цим же посиланням.
            </div>
          )}

          {offers.map((offer) => {
            const partner = partnersById.get(offer.partner_id);
            return (
              <div key={offer.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-neutral-900">{partner?.name || "Партнер"}</p>
                    <p className="text-xs text-neutral-500">
                      {partner?.type === "shop" ? "Магазин" : "СТО"} • {formatDate(offer.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full bg-neutral-100 text-neutral-800">{offer.status}</Badge>
                    <span className="text-sm font-semibold text-neutral-900">
                      {offer.price ? `${offer.price} ₴` : "Ціну уточнюйте"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <InfoRow label="Термін" value={offer.eta_days ? `${offer.eta_days} дн.` : "—"} />
                  <InfoRow label="Телефон партнера" value={partner?.phone || "—"} />
                </div>

                {offer.note && (
                  <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                    {offer.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 px-3 py-2">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}
