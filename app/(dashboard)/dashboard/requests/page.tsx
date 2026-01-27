import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const demoRequests = [
  { id: "req-1", type: "repair", city: "Київ", status: "new", title: "Діагностика ходової" },
  { id: "req-2", type: "parts", city: "Львів", status: "sent_to_partners", title: "Фільтр масляний Toyota" }
];

export default function DashboardRequestsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Заявки</p>
        <h1 className="text-2xl font-bold">Мої заявки</h1>
        <p className="text-neutral-600">На продакшн підключіть запит до таблиці requests з фільтром client_profile_id.</p>
      </div>
      <div className="grid gap-3">
        {demoRequests.map((req) => (
          <Card key={req.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-neutral-500">{req.type === "repair" ? "Ремонт" : "Запчастини"}</p>
              <p className="text-lg font-semibold">{req.title}</p>
              <p className="text-sm text-neutral-600">{req.city}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">{req.status}</span>
              <Button variant="secondary" size="sm">
                Деталі
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
