import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const demoPartners = [
  { id: "partner-sto-2", name: "Lviv Auto Service", status: "pending", city: "Львів" },
  { id: "partner-shop-3", name: "Odesa Parts Hub", status: "active", city: "Одеса" },
  { id: "partner-sto-7", name: "Kharkiv Drive", status: "blocked", city: "Харків" }
];

const demoComplaints = [
  { id: "compl-1", actor: "client-1", target: "partner-sto-1", status: "new", message: "Запізнились із записом" },
  { id: "compl-2", actor: "client-1", target: "partner-shop-1", status: "in_review", message: "Не відповіли на дзвінок" }
];

const demoStats = [
  { label: "Заявки за тиждень", value: "124", trend: "+12% vs попер." },
  { label: "Оффери від партнерів", value: "367", trend: "+6%" },
  { label: "Активні партнери", value: "58", trend: "+4" },
  { label: "Конверсія вибору оффера", value: "42%", trend: "+3 п.п." }
];

const demoRequests = [
  { id: "req-301", city: "Київ", type: "repair", status: "offers_collecting", partner: "—" },
  { id: "req-302", city: "Львів", type: "parts", status: "client_selected_offer", partner: "PartLab" },
  { id: "req-303", city: "Одеса", type: "repair", status: "in_progress", partner: "Odesa Motor" }
];

const demoKeywords = [
  { term: "сто київ ходова", pos: "12 → 7", change: "↑5" },
  { term: "запчастини львів доставка", pos: "18 → 11", change: "↑7" },
  { term: "розвал сходження ціна", pos: "9 → 6", change: "↑3" }
];

const badge = (status: string) => {
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  if (status === "blocked") return "bg-rose-100 text-rose-800";
  if (status === "new") return "bg-amber-100 text-amber-800";
  if (status === "in_review") return "bg-blue-100 text-blue-800";
  if (status === "resolved") return "bg-emerald-100 text-emerald-800";
  return "bg-neutral-100 text-neutral-800";
};

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-neutral-900">Адмін-модерація</p>
        <h1 className="text-2xl font-bold">Керування платформою</h1>
        <p className="text-neutral-600">Модерація, звернення та ключові метрики платформи.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {demoStats.map((s) => (
          <Card key={s.label} className="space-y-1 border-neutral-200 bg-white/80">
            <p className="text-sm text-neutral-600">{s.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-emerald-600">{s.trend}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Профілі партнерів</h2>
          <Button size="sm" variant="secondary">Оновити</Button>
        </div>
        <div className="space-y-2">
          {demoPartners.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
              <div>
                <p className="font-semibold text-neutral-900">{p.name}</p>
                <p className="text-sm text-neutral-600">ID: {p.id} · {p.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={badge(p.status)}>{p.status}</Badge>
                <Button size="sm" variant="secondary">Блок</Button>
                <Button size="sm" variant="primary">Активувати</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Скарги</h2>
          <Button size="sm" variant="secondary">Експорт</Button>
        </div>
        <div className="space-y-2">
          {demoComplaints.map((c) => (
            <div key={c.id} className="flex items-start justify-between rounded-xl border border-neutral-200 p-3">
              <div>
                <p className="font-semibold text-neutral-900">#{c.id}</p>
                <p className="text-sm text-neutral-600">Від: {c.actor} → {c.target}</p>
                <p className="text-sm text-neutral-800">{c.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={badge(c.status)}>{c.status}</Badge>
                <Button size="sm" variant="secondary">Взяти в роботу</Button>
                <Button size="sm" variant="primary">Закрити</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Заявки та оффери</h2>
            <Button size="sm" variant="secondary">Оновити</Button>
          </div>
          <div className="space-y-2">
            {demoRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm">
                <div>
                  <p className="font-semibold text-neutral-900">{r.id} · {r.city}</p>
                  <p className="text-neutral-600">{r.type === "repair" ? "Ремонт" : "Запчастини"} · {r.partner}</p>
                </div>
                <Badge className={badge(r.status)}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">SEO / маркетинг</h2>
            <Button size="sm" variant="secondary">Детальніше</Button>
          </div>
          <div className="space-y-2 text-sm text-neutral-700">
            <p className="font-semibold text-neutral-900">Популярні запити (позиції)</p>
            <ul className="space-y-1">
              {demoKeywords.map((k) => (
                <li key={k.term} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span>{k.term}</span>
                  <span className="text-emerald-700 text-xs font-semibold">{k.pos} ({k.change})</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500">Дані анонімні, зібрані по містах і категоріях.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
