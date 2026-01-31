"use client";

import Link from "next/link";
import { CalendarClock, Inbox, PlusCircle, Sparkles, TriangleAlert } from "lucide-react";

import { demoOffers, demoRequests, demoCities } from "@/lib/data/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const statusLabel: Record<string, string> = {
  draft: "Чернетка",
  published: "Опубліковано",
  offers_collecting: "Збираємо пропозиції",
  client_selected_offer: "Ви обрали виконавця",
  in_progress: "В роботі",
  done: "Завершено",
  cancelled: "Скасовано",
  expired: "Протерміновано",
  new: "Нова"
};

const activeStatuses = ["new", "published", "offers_collecting", "client_selected_offer", "in_progress"];

export default function DashboardHomePage() {
  const activeRequests = demoRequests.filter((r) => activeStatuses.includes(r.status));
  const lastActive = activeRequests[0];
  const newOffers = demoOffers.filter((o) => o.status === "sent");
  const waiting = newOffers.length;
  const lastActiveCity = lastActive ? demoCities.find((c) => c.id === lastActive.city_id)?.name_ua || lastActive.city_id : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Кабінет клієнта</p>
          <h1 className="text-2xl font-bold text-neutral-900">Швидкий огляд</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full bg-neutral-900 px-4 hover:-translate-y-0.5 hover:shadow-md">
            <Link href="/request/repair">Заявка на ремонт</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="rounded-full px-4 hover:-translate-y-0.5 hover:shadow-md">
            <Link href="/request/parts">Заявка на запчастини</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Активні заявки" value={activeRequests.length} icon={<Inbox className="h-4 w-4" />} />
        <StatCard label="Нові пропозиції" value={newOffers.length} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Очікують відповіді" value={waiting} icon={<CalendarClock className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="space-y-4 rounded-2xl border border-neutral-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Остання активна заявка</p>
              <h2 className="text-xl font-semibold text-neutral-900">{lastActive ? "Перевірте пропозиції" : "Немає активних"}</h2>
            </div>
            <Badge className="rounded-full bg-amber-100 text-amber-800">Заявки</Badge>
          </div>
          {lastActive ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    {lastActive.type === "repair" ? "Ремонт" : "Запчастини"}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {lastActive.problem_description || lastActive.part_query || "Заявка"}
                  </p>
                  <p className="text-sm text-neutral-600">Місто: {lastActiveCity}</p>
                </div>
                <Badge className="rounded-full bg-neutral-100 text-neutral-800">
                  {statusLabel[lastActive.status] ?? lastActive.status}
                </Badge>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <TinyStat label="Партнери бачать" value="18" />
                <TinyStat label="Пропозицій отримано" value={demoOffers.filter((o) => o.request_id === lastActive.id).length} />
                <TinyStat label="Статус" value={statusLabel[lastActive.status] ?? lastActive.status} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-neutral-900 px-4 hover:-translate-y-0.5 hover:shadow-md">
                  <Link href={`/dashboard/requests/${lastActive.id}`}>Переглянути пропозиції</Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-full px-4 hover:-translate-y-0.5 hover:shadow-md">
                  <Link href="/request/repair">Нова заявка</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-neutral-600">Активних заявок немає.</div>
          )}
        </Card>

        <Card className="space-y-4 rounded-2xl border border-neutral-100 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Швидкі дії</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction href="/request/repair" title="Заявка на ремонт" />
            <QuickAction href="/request/parts" title="Заявка на запчастину" />
            <QuickAction href="/dashboard/cars" title="Додати авто" />
            <QuickAction href="/dashboard/requests" title="Мої заявки" />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-600" />
              <p>Контакти партнерів відкриються після того, як ви оберете пропозицію. Жодного спаму.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-neutral-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Активні заявки</p>
            <h3 className="text-lg font-semibold text-neutral-900">Швидкий список</h3>
          </div>
          <Button asChild size="sm" variant="secondary" className="rounded-full px-4">
            <Link href="/dashboard/requests">Усі заявки</Link>
          </Button>
        </div>
        <div className="mt-3 grid gap-3">
          {activeRequests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-3">
              <Badge variant="secondary" className="rounded-full">
                {r.type === "repair" ? "Ремонт" : "Запчастини"}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{r.problem_description || r.part_query || "Заявка"}</p>
                <p className="text-xs text-neutral-600">Місто: {r.city_id}</p>
              </div>
              <Badge className="rounded-full">{statusLabel[r.status] ?? r.status}</Badge>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href={`/dashboard/requests/${r.id}`}>Відкрити</Link>
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-4 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">{icon}</div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      </div>
    </Card>
  );
}

function TinyStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function QuickAction({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-3 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {title}
      <PlusCircle className="h-4 w-4 text-neutral-500" />
    </Link>
  );
}
