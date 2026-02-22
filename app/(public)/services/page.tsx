import Link from "next/link";
import type { Metadata } from "next";

import { ServicesDiscoveryPanel } from "@/components/services/services-discovery-panel";
import { Card } from "@/components/ui/card";
import { getCities, getServices } from "@/lib/supabase/queries";
import { serviceCatalog } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Всі послуги для авто — Pitly",
  description: "Каталог автопослуг: СТО, шиномонтаж, електрика, кузов, кондиціонери та інше. Оберіть послугу і знайдіть сервіс у своєму місті."
};

export default async function ServicesPage() {
  const [cities, services] = await Promise.all([getCities(), getServices()]);
  const topCities = cities.slice(0, 8);
  const faq = [
    {
      q: "Як знайти потрібну автопослугу у своєму місті?",
      a: "Перейдіть у каталог послуг, оберіть конкретну послугу або категорію, потім місто — відкриється список СТО з фільтрами."
    },
    {
      q: "Чи є окремі сторінки послуг для SEO?",
      a: "Так, кожна послуга має окрему сторінку виду /services/{slug}, а також сторінку у місті виду /{city}/services/{slug}."
    },
    {
      q: "Чи можна знайти СТО, яке також продає запчастини?",
      a: "Так, на сторінках списків використовуйте фільтр \"Є запчастини\", щоб бачити СТО, які закривають ремонт і деталі під ключ."
    }
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-neutral-500">Каталог послуг</p>
        <h1 className="text-3xl font-bold text-neutral-900">Всі послуги</h1>
        <p className="text-neutral-600">
          Оберіть категорію послуги, потім місто, і ми покажемо список місць з фільтрами.
        </p>
      </div>

      <ServicesDiscoveryPanel cities={cities} services={services} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceCatalog.map((item) => (
          <Card key={item.slug} className="flex flex-col gap-3 border border-neutral-200/80 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-900">{item.title}</h2>
              <p className="text-sm text-neutral-600">{item.short}</p>
            </div>
            <p className="text-sm text-neutral-700">{item.description}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Link
                href={`/services/${item.slug}`}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Переглянути
              </Link>
              {topCities[0] && (
                <Link
                  href={`/${topCities[0].slug}/services/${item.slug}`}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800"
                >
                  Знайти в місті
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900">Швидкий вибір міста</h3>
        <div className="flex flex-wrap gap-2">
          {topCities.map((city) => (
            <Link
              key={city.id}
              href={`/${city.slug}/services/sto-remont`}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              {city.name_ua}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900">FAQ: Всі послуги</h3>
        <div className="space-y-2 text-sm text-neutral-700">
          {faq.map((item) => (
            <div key={item.q}>
              <p className="font-semibold text-neutral-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
