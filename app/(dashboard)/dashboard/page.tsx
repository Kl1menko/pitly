"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoOffers, demoOrders, demoRequests } from "@/lib/data/demo";
import { Badge } from "@/components/ui/badge";

const statusMeta: Record<
  string,
  { color: string; label: string }
> = {
  draft: { color: "bg-neutral-100 text-neutral-800", label: "чернетка" },
  published: { color: "bg-neutral-100 text-neutral-800", label: "опубліковано" },
  offers_collecting: { color: "bg-amber-100 text-amber-800", label: "збираємо оффери" },
  client_selected_offer: { color: "bg-blue-100 text-blue-800", label: "обрано оффер" },
  in_progress: { color: "bg-blue-100 text-blue-800", label: "в роботі" },
  done: { color: "bg-emerald-100 text-emerald-800", label: "виконано" },
  cancelled: { color: "bg-rose-100 text-rose-800", label: "скасовано" },
  expired: { color: "bg-neutral-100 text-neutral-800", label: "протерміновано" },
  sent: { color: "bg-neutral-100 text-neutral-800", label: "надіслано" },
  viewed: { color: "bg-neutral-100 text-neutral-800", label: "переглянуто" },
  accepted: { color: "bg-blue-100 text-blue-800", label: "прийнято" },
  rejected: { color: "bg-rose-100 text-rose-800", label: "відхилено" },
  expired_offer: { color: "bg-neutral-100 text-neutral-800", label: "прострочено" }
};

export default function DashboardHomePage() {
  const [viewAs, setViewAs] = useState<"client" | "partner">("client");

  const clientRequests = demoRequests;
  const orders = demoOrders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Кабінет</p>
          <h1 className="text-2xl font-bold">Швидкий огляд</h1>
          <p className="text-neutral-600">Перемикайтеся між ролями клієнта та партнера для перевірки флоу.</p>
        </div>
        <div className="flex rounded-full border border-neutral-200 p-1 text-sm font-semibold">
          <button
            onClick={() => setViewAs("client")}
            className={`rounded-full px-3 py-1 ${viewAs === "client" ? "bg-neutral-900 text-white" : "text-neutral-700"}`}
          >
            Клієнт
          </button>
          <button
            onClick={() => setViewAs("partner")}
            className={`rounded-full px-3 py-1 ${viewAs === "partner" ? "bg-neutral-900 text-white" : "text-neutral-700"}`}
          >
            Партнер
          </button>
        </div>
      </div>

      {viewAs === "client" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Мої заявки</p>
                <p className="text-xl font-semibold">{clientRequests.length}</p>
              </div>
              <Button asChild size="sm">
                <Link href="/request/repair">Нова заявка</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {clientRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-neutral-500">{r.type === "repair" ? "Ремонт" : "Запчастини"}</p>
                    <p className="font-semibold text-neutral-900">{r.problem_description || r.part_query || "Заявка"}</p>
                  </div>
                  <Badge className={statusMeta[r.status]?.color ?? "bg-neutral-100 text-neutral-800"}>
                    {statusMeta[r.status]?.label ?? r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Оффери по заявках</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/requests">Детальніше</Link>
              </Button>
            </div>
            <div className="space-y-2">
                  {demoOffers.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                      <div>
                        <p className="text-sm text-neutral-600">Заявка {o.request_id}</p>
                        <p className="font-semibold text-neutral-900">
                          ₴{o.price ?? "—"} · {o.eta_days ?? "—"} дн
                        </p>
                      </div>
                      <Badge className={statusMeta[o.status]?.color ?? "bg-neutral-100 text-neutral-800"}>
                        {statusMeta[o.status]?.label ?? o.status}
                      </Badge>
                    </div>
                  ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Вхідні заявки</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/requests">Стрічка</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {clientRequests.map((r) => (
                <div key={r.id} className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-sm uppercase tracking-wide text-neutral-500">{r.type === "repair" ? "Ремонт" : "Запчастини"}</p>
                  <p className="font-semibold text-neutral-900">{r.problem_description || r.part_query || "Заявка"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant="primary">
                      Створити оффер
                    </Button>
                    <Button size="sm" variant="secondary">
                      Деталі
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="space-y-3">
              <p className="text-sm text-neutral-600">Активні замовлення</p>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                    <div>
                      <p className="text-sm text-neutral-600">Order {o.id}</p>
                      <p className="font-semibold text-neutral-900">{o.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        Оновити статус
                      </Button>
                      <Button size="sm" variant="primary">
                        Чат
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-2 bg-neutral-50">
              <p className="text-sm font-semibold text-neutral-900">Порівняння з конкурентами (анонімно)</p>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li>• Ціни, відгуки, популярні послуги поруч</li>
                <li>• Власник бачить, де втрачає клієнтів</li>
              </ul>
              <hr className="border-neutral-200" />
              <p className="text-sm font-semibold text-neutral-900">SEO + маркетинг-дашборд</p>
              <ul className="space-y-1 text-sm text-neutral-700">
                <li>• 📍 Локальний рейтинг</li>
                <li>• 📞 Звідки дзвінки</li>
                <li>• 💵 Які послуги дають прибуток</li>
              </ul>
              <p className="text-xs text-neutral-500">Просто й зрозуміло — дані скоро доступні в кабінеті.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
