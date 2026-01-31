import { Card } from "@/components/ui/card";
import { SafeVideo } from "@/components/shared/safe-video";
import Link from "next/link";

export const metadata = {
  title: "Як працює Pitly — кроки для клієнтів та партнерів",
  description: "Проста подача заявки на ремонт або запчастини. Партнери отримують ліди та керують профілем."
};

const faq = [
  { q: "Чи потрібна реєстрація, щоб залишити заявку?", a: "Ні, достатньо телефону. Реєстрація потрібна партнерам." },
  { q: "Як перевіряєте партнерів?", a: "Адмін модерує профілі, статус 'active' отримують підтверджені компанії." },
  { q: "Чи зберігаються мої заявки?", a: "Так, якщо ви авторизовані. Гості отримують дзвінок без кабінету." }
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
      {/* Hero */}
      <div className="grid gap-6 overflow-hidden rounded-3xl bg-neutral-900 p-6 text-white md:grid-cols-[1.15fr_1fr] md:p-8 shadow-lg shadow-neutral-900/15">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Про сервіс</p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">Як працює Pitly</h1>
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
        <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-neutral-800 md:h-64">
          <SafeVideo src="/videos/video_car.mp4" poster="/images/img_banner.gif" roundedClassName="rounded-2xl" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/30 to-transparent" />
        </div>
      </div>

      {/* Чіткий поділ: клієнт vs партнер */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 bg-white/90 p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Для клієнтів</p>
            <h2 className="text-2xl font-bold text-neutral-900">Ремонт і запчастини без хаосу</h2>
          </div>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• Без спам-дзвінків — зв’язок лише після вашого підтвердження.</li>
            <li>• Перевірені СТО та магазини у вашому місті.</li>
            <li>• Пропозиції з ціною та ETA до дзвінка — обираєте найкращу.</li>
            <li>• Онлайн-запис, нагадування про візит, історія заявок.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request/repair"
              className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Створити заявку
            </Link>
            <Link
              href="/request/parts"
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5"
            >
              Запчастини за VIN
            </Link>
          </div>
        </Card>

        <Card className="space-y-4 bg-white/90 p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Для власників СТО чи магазинів</p>
            <h2 className="text-2xl font-bold text-neutral-900">Теплі ліди без реклами</h2>
          </div>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• Заявки від клієнтів у вашому місті, без холодних дзвінків.</li>
            <li>• Каталог з рейтингом, відгуками та профілем послуг/категорій.</li>
            <li>• Відповідайте пропозицією з ціною й терміном — клієнт бачить усе в одному місці.</li>
            <li>• Кабінет: статуси, чат, базові метрики по конверсії.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Стати партнером
            </Link>
            <Link
              href="/dashboard?demo=partner"
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5"
            >
              Подивитись демо
            </Link>
          </div>
        </Card>
      </div>

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
