"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const funnel = [
  { label: "Заявки", value: 120 },
  { label: "Переглянуті", value: 96 },
  { label: "Оффери", value: 62 },
  { label: "Прийняті", value: 28 },
  { label: "Завершені", value: 19 }
];

const ratingTrend = [4.5, 4.6, 4.65, 4.7, 4.68, 4.72];
const reviewsTrend = [12, 19, 24, 31, 28, 34];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Аналітика</p>
          <h1 className="text-2xl font-bold">Показники ефективності</h1>
          <p className="text-neutral-600">Воронка, рейтинг, чек і географія заявок (демо-дані).</p>
        </div>
        <Badge className="rounded-full bg-neutral-900 text-white px-3 py-2">Оновлено 5 хв тому</Badge>
      </header>

      <Card className="space-y-3 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Воронка</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {funnel.map((step) => {
            const max = funnel[0].value;
            const width = Math.max(30, Math.round((step.value / max) * 100));
            return (
              <div key={step.label} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-neutral-800">{step.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{step.value}</p>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-neutral-900" style={{ width: `${width}%` }} />
                </div>
                <p className="text-xs text-neutral-500">Конверсія від старту: {Math.round((step.value / max) * 100)}%</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-neutral-900">Рейтинг / відгуки в динаміці</h3>
          <MiniBars labels={["-5", "-4", "-3", "-2", "-1", "Сьогодні"]} series={[{ label: "Рейтинг", data: ratingTrend, color: "bg-neutral-900" }]} />
          <MiniBars labels={["-5", "-4", "-3", "-2", "-1", "Сьогодні"]} series={[{ label: "Відгуки", data: reviewsTrend, color: "bg-emerald-500" }]} />
        </Card>

        <Card className="space-y-3 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-neutral-900">Середній чек (демо)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Stat title="СТО" value="3 200 ₴" sub="+8% м/м" />
            <Stat title="Запчастини" value="2 150 ₴" sub="+4% м/м" />
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Додайте більше завершених замовлень з цінами, щоб бачити точніший чек.
          </div>
        </Card>
      </div>

      <Card className="space-y-3 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Теплова мапа заявок (місто)</h3>
          <span className="text-xs text-neutral-500">Опціонально</span>
        </div>
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
          Тут можна відрендерити heatmap по координатах заявок (демо-заглушка).
        </div>
      </Card>
    </div>
  );
}

function MiniBars({ labels, series }: { labels: string[]; series: { label: string; data: number[]; color: string }[] }) {
  return (
    <div className="space-y-2">
      {series.map((s) => (
        <div key={s.label} className="space-y-1">
          <p className="text-sm font-semibold text-neutral-800">{s.label}</p>
          <div className="flex h-16 items-end gap-1 rounded-xl border border-neutral-100 bg-white p-2 shadow-sm">
            {s.data.map((v, idx) => {
              const height = Math.max(10, Math.round((v / Math.max(...s.data)) * 100));
              return <div key={`${s.label}-${idx}`} className={`${s.color} w-full rounded-sm`} style={{ height: `${height}%` }} />;
            })}
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            {labels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-600">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-emerald-600">{sub}</p>}
    </div>
  );
}
