import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const demoMessages = [
  { id: "m1", from: "Клієнт", text: "Доброго дня, коли зможете глянути?" },
  { id: "m2", from: "СТО", text: "Можемо сьогодні після 16:00. Потрібна діагностика ходової." },
  { id: "m3", from: "Клієнт", text: "Підходить, записуйте." }
];

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-neutral-900">Чат</p>
        <h1 className="text-2xl font-bold">Повідомлення по заявці</h1>
        <p className="text-neutral-600">Мок-версія чату в межах заявки. Реалізуйте через Supabase Realtime.</p>
      </div>

      <Card className="space-y-3">
        <div className="space-y-2">
          {demoMessages.map((m) => (
            <div key={m.id} className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs font-semibold text-neutral-500">{m.from}</p>
              <p className="text-sm text-neutral-900">{m.text}</p>
            </div>
          ))}
        </div>
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Введіть повідомлення..."
            className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <Button type="submit">Надіслати</Button>
        </form>
      </Card>
    </div>
  );
}
