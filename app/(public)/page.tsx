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
    "сто рейтинг",
  ],
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
      title: "Каталог СТО",
      desc: "Перевірені партнери по містах України. Вибір за рейтингом і послугами.",
      href: "/cities",
      cta: "Перейти до каталогу",
      video: "/videos/vid1.mp4",
    },
    {
      title: "Запчастини з доставкою",
      desc: "Магазини автозапчастин, фільтри за брендом авто і категорією деталей.",
      href: "/request/parts",
      cta: "Запросити деталь",
      video: "/videos/vid2.mp4",
    },
    {
      title: "Заявка на ремонт",
      desc: "Опишіть проблему, додайте фото — партнери отримають ваш запит за хвилину.",
      href: "/request/repair",
      cta: "Подати заявку",
      video: "/videos/vid3.mp4",
    },
    {
      title: "Партнерський кабінет",
      desc: "Додайте свій сервіс чи магазин, керуйте профілем і отримуйте ліди.",
      href: "/register",
      cta: "Стати партнером",
      video: "/videos/vid4.mp4",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
      <SearchHero cities={cities} />

      <section className="grid gap-5 md:grid-cols-2">
        {featureCards.map((card, idx) => (
          <Card
            key={card.title}
            className="relative overflow-hidden bg-white/90 p-0 ring-1 ring-neutral-200 shadow-lg"
          >
            <div className="grid h-full grid-cols-1 gap-0 md:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col justify-between gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{`0${idx + 1}`}</p>
                    <h3 className="text-2xl font-bold text-neutral-900">
                      {card.title}
                    </h3>
                    <p className="text-sm text-neutral-700">{card.desc}</p>
                  </div>
                </div>
                <Link
                  href={card.href}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {card.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative overflow-hidden rounded-b-3xl md:rounded-l-none md:rounded-r-3xl">
                <video
                  src={card.video}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster=""
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/30 via-white/10 to-transparent" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярні міста</h2>
          <Link
            href="/cities"
            className="text-sm font-semibold text-neutral-900 transition hover:text-neutral-700"
          >
            Усі міста
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {topCities.map((city) => (
            <Card
              key={city.id}
              className="flex items-center justify-between gap-2 bg-white/90 shadow-sm ring-1 ring-neutral-200"
            >
              <div>
                <p className="text-lg font-semibold">{city.name_ua}</p>
                <p className="text-sm text-neutral-600">{city.region_ua}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/${city.slug}/sto`}
                  className="flex items-center gap-1 text-sm text-neutral-900 transition hover:text-neutral-700"
                >
                  СТО <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${city.slug}/shops`}
                  className="flex items-center gap-1 text-sm text-neutral-900 transition hover:text-neutral-700"
                >
                  Магазини <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 p-8 text-white sm:p-10 md:grid md:grid-cols-2 md:items-center min-h-[320px] gap-6">
        <video
          src="/videos/video_banner.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-neutral-900/30" />
        <div className="relative flex flex-col justify-center space-y-3">
          <h3 className="text-2xl font-bold">Додайте свій сервіс чи магазин</h3>
          <p className="text-white/80">
            Отримуйте теплі ліди без зайвих витрат. Керуйте профілем у кабінеті.
          </p>
        </div>
        <div className="relative mt-4 flex flex-col items-start gap-3 text-sm font-semibold sm:mt-0 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/register"
            className="w-full rounded-full bg-white px-5 py-3 text-center text-neutral-900 shadow-md sm:w-auto"
          >
            Стати партнером
          </Link>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-white sm:w-auto"
          >
            Увійти в кабінет <MapPin className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
