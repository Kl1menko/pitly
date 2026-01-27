export const metadata = {
  title: "СТО та запчастини по Україні — знайди сервіс і деталі",
  description:
    "Каталог СТО та магазинів запчастин по всій Україні. Підбір за містом, послугою та маркою авто. Залишайте заявку — підберемо варіанти швидко.",
  keywords: [
    "сто україна",
    "автосервіс україна",
    "знайти сто",
    "ремонт авто",
    "запчастини україна",
    "магазин автозапчастин",
    "автозапчастини за містом",
    "запис на сто",
    "підбір сто за містом",
    "підбір автозапчастин",
    "підібрати запчастини по авто",
    "сто рейтинг"
  ]
};

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { SearchHero } from "@/components/shared/search-hero";
import { Card } from "@/components/ui/card";
import { getCities } from "@/lib/supabase/queries";

export default async function HomePage() {
  const cities = await getCities();
  const topCities = cities.slice(0, 6);
  const featureCards = [
    {
      variant: "dark" as const,
      title: "Каталог СТО",
      desc: "Перевірені партнери по містах України. Вибір за рейтингом і послугами.",
      href: "/cities",
      cta: "Перейти до каталогу",
      video: "/videos/vid1.mp4"
    },
    {
      variant: "default" as const,
      title: "Запчастини з доставкою",
      desc: "Магазини автозапчастин, фільтри за брендом авто і категорією деталей.",
      href: "/request/parts",
      cta: "Запросити деталь",
      video: "/videos/vid2.mp4"
    },
    {
      variant: "default" as const,
      title: "Заявка на ремонт",
      desc: "Опишіть проблему, додайте фото — партнери отримають ваш запит за хвилину.",
      href: "/request/repair",
      cta: "Подати заявку",
      video: "/videos/vid3.mp4"
    },
    {
      variant: "default" as const,
      title: "Партнерський кабінет",
      desc: "Додайте свій сервіс чи магазин, керуйте профілем і отримуйте ліди.",
      href: "/register",
      cta: "Стати партнером",
      video: "/videos/vid4.mp4"
    }
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
      <SearchHero cities={cities} />

      <section className="grid gap-4 md:grid-cols-2">
        {featureCards.map((card, idx) => (
          <Card key={card.title} variant={card.variant} className="flex flex-col gap-4 overflow-hidden p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-neutral-500">{`0${idx + 1}`}</p>
                <h3 className={`text-xl font-bold ${card.variant === "dark" ? "text-white" : "text-neutral-900"}`}>
                  {card.title}
                </h3>
                <p className={`mt-2 text-sm ${card.variant === "dark" ? "text-neutral-200" : "text-neutral-700"}`}>{card.desc}</p>
                <Link
                  href={card.href}
                  className={`mt-3 inline-flex items-center gap-2 text-sm font-semibold ${
                    card.variant === "dark" ? "text-primary" : "text-neutral-900"
                  }`}
                >
                  {card.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-neutral-900 sm:flex">
                {idx + 1}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-neutral-200">
              <video
                src={card.video}
                className="h-44 w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster=""
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярні міста</h2>
          <Link href="/cities" className="text-sm font-semibold text-primary">
            Усі міста
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {topCities.map((city) => (
            <Card key={city.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{city.name_ua}</p>
                <p className="text-sm text-neutral-600">{city.region_ua}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/${city.slug}/sto`} className="flex items-center gap-1 text-sm text-primary">
                  СТО <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/${city.slug}/shops`} className="flex items-center gap-1 text-sm text-primary">
                  Магазини <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-primary">Як працює</p>
          <h3 className="mt-2 text-xl font-bold">1. Оберіть місто</h3>
          <p className="text-neutral-600">Каталог активних партнерів, вказані послуги та категорії деталей.</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-primary">Заявка</p>
          <h3 className="mt-2 text-xl font-bold">2. Залишіть заявку</h3>
          <p className="text-neutral-600">Опишіть проблему або потрібну деталь. Додавайте фото.</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-primary">Результат</p>
          <h3 className="mt-2 text-xl font-bold">3. Отримайте дзвінок</h3>
          <p className="text-neutral-600">Партнери зв’яжуться напряму. Ви обираєте найкращу пропозицію.</p>
        </Card>
      </section>

      <section className="grid gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Для партнерів</p>
          <h3 className="text-2xl font-bold">Додайте свій сервіс чи магазин</h3>
          <p className="text-white/80">Отримуйте теплі ліди без зайвих витрат. Керуйте профілем у кабінеті.</p>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Link href="/register" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700">
            Стати партнером
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-white">
            Увійти в кабінет <MapPin className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
