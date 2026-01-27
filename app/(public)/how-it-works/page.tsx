import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Як працює CTO Hub — кроки для клієнтів та партнерів",
  description: "Проста подача заявки на ремонт або запчастини. Партнери отримують ліди та керують профілем."
};

const steps = [
  { title: "Обираєте місто та тип", text: "СТО або запчастини. Ми показуємо активних партнерів." },
  { title: "Залишаєте заявку", text: "Опишіть проблему або деталь. Додайте фото, щоб пришвидшити відповідь." },
  { title: "Партнери відповідають", text: "Ми надсилаємо запит сервісам/магазинам. Вони контактують напряму." }
];

const faq = [
  { q: "Чи потрібна реєстрація, щоб залишити заявку?", a: "Ні, достатньо телефону. Реєстрація потрібна партнерам." },
  { q: "Як перевіряєте партнерів?", a: "Адмін модерує профілі, статус 'active' отримують підтверджені компанії." },
  { q: "Чи зберігаються мої заявки?", a: "Так, якщо ви авторизовані. Гості отримують дзвінок без кабінету." }
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-primary">Про сервіс</p>
        <h1 className="text-3xl font-bold leading-tight">Як працює CTO Hub</h1>
        <p className="text-neutral-700">Три простих кроки від пошуку до дзвінка. Партнери отримують якісні ліди.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-700">{step.text}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="grid gap-3">
          {faq.map((item) => (
            <Card key={item.q}>
              <p className="text-lg font-semibold">{item.q}</p>
              <p className="text-sm text-neutral-700">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
