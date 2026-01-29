import { Card } from "@/components/ui/card";
import Link from "next/link";
import { HowTabs } from "@/components/how-it-works/tabs";

export const metadata = {
  title: "Як працює Pitly — кроки для клієнтів та партнерів",
  description: "Проста подача заявки на ремонт або запчастини. Партнери отримують ліди та керують профілем."
};

const faq = [
  { q: "Чи потрібна реєстрація, щоб залишити заявку?", a: "Ні, достатньо телефону. Реєстрація потрібна партнерам." },
  { q: "Як перевіряєте партнерів?", a: "Адмін модерує профілі, статус 'active' отримують підтверджені компанії." },
  { q: "Чи зберігаються мої заявки?", a: "Так, якщо ви авторизовані. Гості отримують дзвінок без кабінету." }
];

const tabs = [
  {
    id: "clients",
    label: "Для клієнтів",
    title: "Ремонт і запчастини без хаосу",
    bullets: [
      "Без спам-дзвінків — зв’язок лише після вашого підтвердження.",
      "Перевірені СТО та магазини, які вже працюють у вашому місті.",
      "Ціни та терміни до дзвінка: бачите пропозиції — обираєте найкращу.",
      "Онлайн-запис у 2 кліки, нагадування про візит.",
      "Зберігаємо історію заявок і статуси, щоб нічого не загубилось."
    ],
    cta: { href: "/request/repair", label: "Створити заявку" },
    extra: "Середній час першої відповіді — до 15 хвилин."
  },
  {
    id: "partners",
    label: "Для власників СТО чи магазинів",
    title: "Теплі ліди без реклами",
    bullets: [
      "Заявки без холодних дзвінків — клієнт уже зацікавлений.",
      "Фільтруйте ліди: тип робіт, марка авто, бажаний термін.",
      "Аналітика: конверсія в дзвінки, популярні послуги, середній чек.",
      "Рейтинг і відгуки — піднімайте позицію в каталозі.",
      "Підключення за 1 день: модерація, профіль, прайси й графік."
    ],
    cta: { href: "/register", label: "Стати партнером" },
    extra: "Оплата лише за фактичні заявки, без щомісячної реклами."
  }
] as const;

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
      <div className="grid gap-6 overflow-hidden rounded-3xl bg-neutral-900 p-6 text-white md:grid-cols-[1.3fr_1fr] md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Про сервіс</p>
          <h1 className="text-3xl font-bold leading-tight">Як працює Pitly</h1>
          <p className="text-white/80">
            Заявка займає до 1 хвилини. Партнери бачать ваш запит, дають пропозиції, ви обираєте найкращий варіант.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm" href="/request/repair">
              Заявка на ремонт
            </Link>
            <Link className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white" href="/request/parts">
              Заявка на запчастини
            </Link>
          </div>
        </div>
        <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-neutral-800">
          <video
            src="/videos/video_car.mp4"
            poster="/images/img_banner.gif"
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/30 to-transparent" />
        </div>
      </div>

      <section className="rounded-3xl bg-white/80 p-4 ring-1 ring-neutral-200 shadow-sm">
        <HowTabs tabs={tabs} />
      </section>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
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
        <Card className="flex h-full flex-col justify-between bg-neutral-900 text-white">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Партнерам</p>
            <h3 className="text-xl font-bold">Підключайтесь до Pitly</h3>
            <p className="text-white/80">Модеруємо профілі, показуємо у каталозі, передаємо теплі ліди з форм.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm">
              Стати партнером
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white">
              Увійти в кабінет
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
