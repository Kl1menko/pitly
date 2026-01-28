import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const demoPartners = [
  { id: "partner-sto-2", name: "Lviv Auto Service", status: "pending" },
  { id: "partner-shop-3", name: "Odesa Parts Hub", status: "active" }
];

const demoComplaints = [
  { id: "compl-1", actor: "client-1", target: "partner-sto-1", status: "new", message: "Запізнились із записом" },
  { id: "compl-2", actor: "client-1", target: "partner-shop-1", status: "in_review", message: "Не відповіли на дзвінок" }
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
        <h1 className="text-2xl font-bold">Партнери та скарги</h1>
        <p className="text-neutral-600">Швидкі дії для модерації профілів і скарг користувачів.</p>
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
                <p className="text-sm text-neutral-600">ID: {p.id}</p>
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
    </div>
  );
}
