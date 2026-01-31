import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoOffers, demoOrders, demoRequests } from "@/lib/data/demo";

const statusColor: Record<string, string> = {
  offers_collecting: "bg-amber-100 text-amber-800",
  client_selected_offer: "bg-blue-100 text-blue-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800"
};

export default function DashboardRequestsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-neutral-900">Заявки</p>
        <h1 className="text-2xl font-bold">Мої заявки та пропозиції</h1>
        <p className="text-neutral-600">Перегляд статусів, вибір пропозиції, чат та скарги.</p>
      </div>

      <div className="space-y-4">
        {demoRequests.map((req) => {
          const offers = demoOffers.filter((o) => o.request_id === req.id);
          const order = demoOrders.find((o) => o.request_id === req.id);
          return (
            <Card key={req.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm uppercase tracking-wide text-neutral-500">
                    {req.type === "repair" ? "Ремонт" : "Запчастини"} · {req.city_id}
                  </p>
                  <p className="text-lg font-semibold">
                    {req.problem_description || req.part_query || "Заявка"}
                  </p>
                </div>
                <Badge className={statusColor[req.status] ?? "bg-neutral-100 text-neutral-800"}>
                  {req.status === "offers_collecting" && "збираємо пропозиції"}
                  {req.status === "client_selected_offer" && "обрано пропозицію"}
                  {req.status === "in_progress" && "в роботі"}
                  {req.status === "done" && "виконано"}
                  {req.status === "cancelled" && "скасовано"}
                  {!["offers_collecting","client_selected_offer","in_progress","done","cancelled"].includes(req.status) && req.status}
                </Badge>
              </div>

              {offers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-800">Оффери</p>
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="grid grid-cols-[1fr_110px_110px_140px_120px] bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-600">
                      <span>Примітка</span>
                      <span className="text-right">Ціна</span>
                      <span className="text-right">Термін</span>
                      <span className="text-center">Статус</span>
                      <span className="text-center">Дія</span>
                    </div>
                    <div className="divide-y divide-neutral-200">
                      {offers.map((o) => (
                        <div key={o.id} className="grid grid-cols-[1fr_110px_110px_140px_120px] items-center gap-3 px-3 py-3 text-sm">
                          <div className="text-neutral-800">{o.note || "—"}</div>
                          <div className="text-right font-semibold">₴{o.price ?? "—"}</div>
                          <div className="text-right text-neutral-700">{o.eta_days ?? "—"} дн</div>
                          <div className="flex justify-center">
                            <Badge className={statusColor[o.status] ?? "bg-neutral-100 text-neutral-800"}>
                              {o.status === "sent" && "надіслано"}
                              {o.status === "viewed" && "переглянуто"}
                              {o.status === "accepted" && "прийнято"}
                              {o.status === "rejected" && "відхилено"}
                              {o.status === "expired" && "прострочено"}
                              {!["sent","viewed","accepted","rejected","expired"].includes(o.status) && o.status}
                            </Badge>
                          </div>
                          <div className="flex justify-center gap-2">
                            {req.status !== "client_selected_offer" && (
                              <Button size="sm" variant="primary">Обрати</Button>
                            )}
                            <Button size="sm" variant="secondary">Деталі</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {order && (
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-neutral-600">Order {order.id}</p>
                      <p className="font-semibold text-neutral-900">Статус: {order.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary">Скарга</Button>
                      <Button size="sm" variant="primary">Відкрити чат</Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
