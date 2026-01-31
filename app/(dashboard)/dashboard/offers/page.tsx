"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoOffers, demoRequests } from "@/lib/data/demo";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

const offerStatusLabel: Record<string, string> = {
  sent: "Відправлено",
  viewed: "Переглянуто",
  accepted: "Прийнято",
  rejected: "Відхилено"
};

export default function OffersPage() {
  const [status, setStatus] = useState<"all" | "sent" | "viewed" | "accepted" | "rejected">("all");

  const rows = useMemo(() => {
    return demoOffers
      .filter((o) => status === "all" || o.status === status)
      .map((o) => {
        const req = demoRequests.find((r) => r.id === o.request_id);
        return {
          ...o,
          requestTitle: req?.problem_description || req?.part_query || "Заявка",
          requestType: req?.type === "parts" ? "Деталі" : "Ремонт"
        };
      });
  }, [status]);

  const acceptedRate = Math.round(
    (demoOffers.filter((o) => o.status === "accepted").length / Math.max(1, demoOffers.length)) * 100
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Кабінет партнера</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Мої пропозиції</h1>
          <p className="text-neutral-600 dark:text-neutral-300">Статуси, ціни та конверсія.</p>
        </div>
        <div className="flex gap-2">
          {(["all","sent","viewed","accepted","rejected"] as const).map((s)=>(
            <button
              key={s}
              onClick={()=>setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-semibold transition",
                status===s ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              )}
            >
              {s==="all"?"Усі":offerStatusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
          <span>Заявка</span>
          <span>Тип</span>
          <span>Ціна</span>
          <span>Статус</span>
          <span>Дії</span>
        </div>
        {rows.map((o) => (
          <div key={o.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-neutral-100 px-4 py-3 text-sm text-neutral-800 last:border-b-0 dark:border-neutral-800 dark:text-neutral-200">
            <span className="truncate font-semibold text-neutral-900 dark:text-white">{o.requestTitle}</span>
            <span className="text-neutral-600 dark:text-neutral-300">{o.requestType}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{o.price ? `${o.price} ₴` : "—"}</span>
            <Badge
              className={cn(
                "w-fit rounded-full",
                o.status === "accepted"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                  : o.status === "viewed"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200"
                    : o.status === "rejected"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
                      : "bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-200"
              )}
            >
              {offerStatusLabel[o.status]}
            </Badge>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="secondary" className="rounded-full px-3">
                <Link href={`/dashboard/requests/${o.request_id}`}>Відкрити</Link>
              </Button>
              {o.status !== "accepted" && (
                <Button size="sm" variant="outline" className="rounded-full px-3 border-neutral-300 text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                  Редагувати
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Card className="space-y-3 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Accepted rate</p>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">По типах заявок</h3>
          </div>
          <BarChart3 className="h-5 w-5 text-neutral-500" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Ремонт", value: 64 },
            { label: "Запчастини", value: 58 }
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/60">
              <div className="flex items-center justify-between text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                <span>{row.label}</span>
                <span>{row.value}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div className="h-full rounded-full bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300" style={{ width: `${row.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Загальна конверсія: {acceptedRate}%</p>
      </Card>
    </div>
  );
}
