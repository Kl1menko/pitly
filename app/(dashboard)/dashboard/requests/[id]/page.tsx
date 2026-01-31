"use client";

import { notFound } from "next/navigation";
import { CheckCircle, MapPin, Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoOffers, demoPartners, demoRequests, demoCities } from "@/lib/data/demo";
import { cn } from "@/lib/utils";

const statusSteps = [
  { key: "published", label: "Опубліковано" },
  { key: "offers_collecting", label: "Збираємо пропозиції" },
  { key: "client_selected_offer", label: "Ви обрали виконавця" },
  { key: "in_progress", label: "В роботі" },
  { key: "done", label: "Завершено" }
];

const statusLabel: Record<string, string> = {
  published: "Опубліковано",
  offers_collecting: "Збираємо пропозиції",
  client_selected_offer: "Ви обрали виконавця",
  in_progress: "В роботі",
  done: "Завершено",
  cancelled: "Скасовано",
  expired: "Протерміновано",
  new: "Нова"
};

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const request = demoRequests.find((r) => r.id === params.id);
  if (!request) return notFound();

  const offers = demoOffers.filter((o) => o.request_id === request.id);
  const activeStepIndex = statusSteps.findIndex((s) => s.key === request.status);
  const cityName = demoCities.find((c) => c.id === request.city_id)?.name_ua || request.city_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">Заявка #{request.id}</p>
          <h1 className="text-2xl font-bold text-neutral-900">{request.problem_description || request.part_query || "Заявка"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-800">
              {request.type === "repair" ? "Ремонт" : "Запчастини"}
            </Badge>
            <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
              <MapPin className="h-4 w-4" />
              {cityName}
            </span>
            <Badge className="rounded-full bg-indigo-100 text-indigo-800">{statusLabel[request.status] ?? request.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="rounded-full px-4">
            Редагувати
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full px-4 text-rose-600 border border-rose-200 hover:bg-rose-50">
            Скасувати
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-neutral-100 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">Таймлайн статусу</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {statusSteps.map((step, idx) => {
            const done = idx <= activeStepIndex;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold shadow-sm",
                    done ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-neutral-200 bg-white text-neutral-500"
                  )}
                >
                  {done ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                </span>
                <div className="text-sm font-semibold text-neutral-800">{step.label}</div>
                {idx < statusSteps.length - 1 && <div className="hidden h-[1px] w-10 bg-neutral-200 sm:block" />}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-2xl border border-neutral-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Пропозиції</h3>
            <span className="text-sm text-neutral-600">Отримано: {offers.length}</span>
          </div>
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-neutral-200 shadow-sm lg:block">
            <div className="grid grid-cols-[1.1fr_120px_120px_140px_120px] bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-600">
              <span>Партнер</span>
              <span className="text-right">Ціна</span>
              <span className="text-right">Термін</span>
              <span className="text-center">Статус</span>
              <span className="text-center">Дія</span>
            </div>
            <div className="divide-y divide-neutral-200">
              {offers.map((o) => {
                const partner = demoPartners.find((p) => p.id === o.partner_id);
                return (
                  <div key={o.id} className="grid grid-cols-[1.1fr_120px_120px_140px_120px] items-center gap-3 px-3 py-3 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">{partner?.name ?? "Партнер"}</span>
                        {partner?.verified && <Shield className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-neutral-600">{o.note || "—"}</p>
                    </div>
                    <div className="text-right font-semibold">₴{o.price ?? "—"}</div>
                    <div className="text-right text-neutral-700">{o.eta_days ?? "—"} дн</div>
                    <div className="flex justify-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full",
                          o.status === "sent"
                            ? "bg-neutral-100 text-neutral-800"
                            : o.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {statusLabel[o.status] ?? o.status}
                      </Badge>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" className="rounded-full px-4">Обрати</Button>
                      <Button size="sm" variant="secondary" className="rounded-full px-4">
                        Деталі
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden">
            {offers.map((o) => {
              const partner = demoPartners.find((p) => p.id === o.partner_id);
              return (
                <div key={o.id} className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-neutral-900">{partner?.name ?? "Партнер"}</div>
                    <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-800">
                      {statusLabel[o.status] ?? o.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-700">{o.note || "—"}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                    <span>Ціна: ₴{o.price ?? "—"}</span>
                    <span>Термін: {o.eta_days ?? "—"} дн</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Рейтинг: {partner?.rating_avg ?? "—"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 rounded-full">
                      Обрати
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1 rounded-full">
                      Деталі
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-3 rounded-2xl border border-neutral-100 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Деталі заявки</h3>
          <div className="space-y-3">
            <InfoRow label="Тип" value={request.type === "repair" ? "Ремонт" : "Запчастини"} />
            <InfoRow label="Авто" value={`${request.car_brand_id ?? "Будь-яке"} ${request.car_model_name ?? ""}`} />
            <InfoRow label="Рік" value={request.car_year ?? "—"} />
            <InfoRow label="Місто" value={cityName} />
            <InfoRow label="Опис" value={request.problem_description || request.part_query || "—"} />
          </div>
          <ImportantBlock />
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-neutral-100 py-2 last:border-0">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 text-right max-w-[60%]">{value ?? "—"}</p>
    </div>
  );
}

function ImportantBlock() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-2 font-semibold">
        <Shield className="mt-0.5 h-4 w-4" />
        Важливо
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/90">
        <li>Контакти партнера відкриються після вашого вибору пропозиції.</li>
        <li>Спілкування та маршрут будуть доступні одразу після вибору.</li>
        <li>Якщо щось пішло не так — зверніться у підтримку, ми допоможемо.</li>
      </ul>
    </div>
  );
}
