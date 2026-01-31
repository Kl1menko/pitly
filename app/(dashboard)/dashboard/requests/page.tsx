"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoOffers, demoRequests, demoCities } from "@/lib/data/demo";
import { cn } from "@/lib/utils";

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

const statusGroup: Record<string, "active" | "done" | "cancelled"> = {
  new: "active",
  published: "active",
  offers_collecting: "active",
  client_selected_offer: "active",
  in_progress: "active",
  done: "done",
  cancelled: "cancelled",
  expired: "cancelled"
};

export default function DashboardRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"active" | "done" | "cancelled">("active");
  const [typeFilter, setTypeFilter] = useState<"all" | "repair" | "parts">("all");

  const filtered = useMemo(
    () =>
      demoRequests.filter((r) => {
        const statusMatch = statusGroup[r.status] === statusFilter;
        const typeMatch = typeFilter === "all" || r.type === typeFilter;
        return statusMatch && typeMatch;
      }),
    [statusFilter, typeFilter]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Кабінет клієнта</p>
          <h1 className="text-2xl font-bold text-neutral-900">Мої заявки</h1>
          <p className="text-neutral-600">Переглядайте статуси, пропозиції та переходьте до деталей.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/request/repair">Нова заявка</Link>
          </Button>
        </div>
      </div>

      <Card className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 p-0 shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-800">Статус</span>
            <FilterPill color="bg-neutral-900 text-white" active={statusFilter === "active"} onClick={() => setStatusFilter("active")} label="Активні" />
            <FilterPill color="bg-emerald-100 text-emerald-800 border-emerald-200" active={statusFilter === "done"} onClick={() => setStatusFilter("done")} label="Завершені" />
            <FilterPill color="bg-rose-100 text-rose-800 border-rose-200" active={statusFilter === "cancelled"} onClick={() => setStatusFilter("cancelled")} label="Скасовані" />
          </div>
          <div className="flex items-center gap-2 md:ml-4">
            <span className="text-sm font-semibold text-neutral-800">Тип</span>
            <FilterPill color="bg-neutral-900 text-white" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="Усі" />
            <FilterPill color="bg-blue-100 text-blue-800 border-blue-200" active={typeFilter === "repair"} onClick={() => setTypeFilter("repair")} label="Ремонт" />
            <FilterPill color="bg-amber-100 text-amber-800 border-amber-200" active={typeFilter === "parts"} onClick={() => setTypeFilter("parts")} label="Запчастини" />
          </div>
          <div className="flex md:ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-600"
              onClick={() => {
                setStatusFilter("active");
                setTypeFilter("all");
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Скинути
            </Button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-neutral-600">Немає заявок за вибраними фільтрами.</div>
          )}
          {filtered.map((req) => {
            const offers = demoOffers.filter((o) => o.request_id === req.id);
            const cityName = demoCities.find((c) => c.id === req.city_id)?.name_ua || req.city_id;
            return (
              <div key={req.id} className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-4 first:border-t-0 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("rounded-full", req.type === "repair" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800")}>
                      {req.type === "repair" ? "Ремонт" : "Запчастини"}
                    </Badge>
                    <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                      <MapPin className="h-4 w-4" />
                      {cityName}
                    </span>
                    <Badge
                      className={cn(
                        "rounded-full",
                        req.status === "offers_collecting"
                          ? "bg-indigo-100 text-indigo-800"
                          : req.status === "client_selected_offer"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-800"
                      )}
                    >
                      {statusLabel[req.status] ?? req.status}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-base font-semibold text-neutral-900">
                    {req.problem_description || req.part_query || "Заявка"}
                  </p>
                  <p className="text-xs text-neutral-600">Пропозицій: {offers.length}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:w-56 md:justify-end">
                  <Button asChild size="sm" className="rounded-full px-4">
                    <Link href={`/dashboard/requests/${req.id}`}>Відкрити</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full px-4 border-neutral-300 text-neutral-800 hover:bg-neutral-50">
                    Пропозиції
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FilterPill({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-semibold transition",
        active
          ? color ?? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
      )}
    >
      {label}
    </button>
  );
}
