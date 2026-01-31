"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoOrders, demoOffers, demoRequests, demoCities } from "@/lib/data/demo";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock3, MapPin, PhoneCall, StickyNote, AlertTriangle } from "lucide-react";

type ColumnKey = "accepted" | "in_progress" | "done" | "dispute";

const pipeline: { key: ColumnKey; title: string; statuses: string[]; tone: string }[] = [
  { key: "accepted", title: "Нові (прийняті)", statuses: ["created", "confirmed"], tone: "ring-neutral-200" },
  { key: "in_progress", title: "В роботі", statuses: ["in_progress"], tone: "ring-blue-200" },
  { key: "done", title: "Завершені", statuses: ["fulfilled", "closed"], tone: "ring-emerald-200" },
  { key: "dispute", title: "Спірні / Скарги", statuses: ["refund_requested", "refunded", "cancelled"], tone: "ring-rose-200" }
];

const clientContacts: Record<string, { name: string; phone: string; note?: string }> = {
  "order-1": { name: "Іван П.", phone: "+380 67 123 45 67", note: "Зв'язок після 10:00" },
  "order-2": { name: "Олена К.", phone: "+380 50 222 33 11", note: "Телеграм @olenacar" }
};

export default function OrdersPage() {
  const items = useMemo(() => {
    return demoOrders.map((order) => {
      const offer = demoOffers.find((o) => o.id === order.offer_id);
      const req = demoRequests.find((r) => r.id === order.request_id);
      const cityName = req ? demoCities.find((c) => c.id === req.city_id)?.name_ua || req.city_id : "";
      return {
        ...order,
        title: req?.problem_description || req?.part_query || "Заявка",
        type: req?.type === "parts" ? "Деталі" : "Ремонт",
        price: offer?.price ?? null,
        eta_days: offer?.eta_days ?? null,
        city: cityName,
        contact: clientContacts[order.id]
      };
    });
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Кабінет партнера</p>
          <h1 className="text-2xl font-bold text-neutral-900">Замовлення / Угоди</h1>
          <p className="text-neutral-600">Канбан після прийняття офферу.</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
        {pipeline.map((col) => (
          <Card key={col.key} className={cn("flex min-h-[320px] flex-col gap-3 rounded-2xl border border-neutral-100 p-4 shadow-sm", col.tone)}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-600">{col.title}</h3>
              <Badge className="rounded-full bg-neutral-100 text-neutral-800">{items.filter((o) => col.statuses.includes(o.status)).length}</Badge>
            </div>
            <div className="space-y-3">
              {items.filter((o) => col.statuses.includes(o.status)).map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full bg-neutral-900 text-white">{order.type}</Badge>
                    <span className="flex items-center gap-1 text-xs text-neutral-600">
                      <MapPin className="h-4 w-4" /> {order.city}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">{order.title}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    <InfoChip icon={<Clock3 className="h-4 w-4" />} label={`Термін: ${order.eta_days ?? "—"} дн`} />
                    <InfoChip icon={<CheckCircle className="h-4 w-4" />} label={`Ціна: ${order.price ? `${order.price} ₴` : "договірна"}`} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-neutral-700">
                    {order.contact ? (
                      <>
                        <div className="flex items-center gap-2 font-semibold text-neutral-900">
                          <PhoneCall className="h-4 w-4 text-emerald-600" />
                          {order.contact.name} · {order.contact.phone}
                        </div>
                        {order.contact.note && <p className="text-xs text-neutral-500">{order.contact.note}</p>}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-neutral-500">
                        <PhoneCall className="h-4 w-4" /> Контакти відкриваються після прийняття
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <StickyNote className="h-4 w-4" /> Нотатки партнера: додайте деталі робіт.
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {col.key !== "done" && (
                      <Button size="sm" className="rounded-full px-3" variant={col.key === "dispute" ? "secondary" : "primary"}>
                        Позначити як завершено
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost" className="rounded-full px-3 text-sm text-neutral-700 hover:text-neutral-900">
                      <Link href={`/dashboard/requests/${order.request_id}`}>Деталі</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {items.filter((o) => col.statuses.includes(o.status)).length === 0 && (
                <div className="rounded-xl border border-dashed border-neutral-200 p-3 text-sm text-neutral-500">Немає угод у цій колонці.</div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Контакти клієнта стають доступними лише після прийняття оффера. Стежте за оновленнями статусів.
      </div>
    </div>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
      {icon}
      {label}
    </div>
  );
}
