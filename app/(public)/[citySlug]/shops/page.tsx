import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PartnerCard } from "@/components/cards/partner-card";
import { ShopFilters } from "@/components/filters/shop-filters";
import { Card } from "@/components/ui/card";
import { getBrands, getCityBySlug, getPartCategories, getPartnersByCity } from "@/lib/supabase/queries";

type Props = {
  params: { citySlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: { params: { citySlug: string } }): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);
  const cityName = city?.name_ua ?? "місті";
  return {
    title: `Магазини запчастин у ${cityName} — підбір деталей за авто`,
    description: `Знайдіть магазини автозапчастин у ${cityName}. Фільтри за категоріями деталей та маркою авто. Залиште запит — допоможемо підібрати запчастини.`,
    keywords: [
      `автозапчастини ${cityName}`,
      `магазин запчастин ${cityName}`,
      `купити запчастини ${cityName}`,
      `підбір запчастин ${cityName}`
    ]
  };
}

export default async function ShopsCityPage({ params, searchParams }: Props) {
  const city = await getCityBySlug(params.citySlug);
  if (!city) return notFound();

  const categories = await getPartCategories();
  const brands = await getBrands();
  const cityName = city.name_ua;

  const partners = await getPartnersByCity({
    type: "shop",
    cityId: city.id,
    filters: {
      categories: typeof searchParams.categories === "string" ? searchParams.categories.split(",") : undefined,
      brand: typeof searchParams.brand === "string" ? searchParams.brand : undefined,
      verified: searchParams.verified === "1",
      delivery: searchParams.delivery === "1"
    }
  });

  const faq = [
    {
      q: `Де купити запчастини у ${cityName}?`,
      a: `На Pitly можна знайти магазини запчастин у ${cityName} та відразу залишити запит на потрібну деталь.`
    },
  {
    q: `Як дізнатись ціну та наявність деталі у ${cityName}?`,
    a: `Заповніть форму «Заявка на запчастини» з VIN чи назвою деталі — магазини у ${cityName} надішлють пропозиції з ціною і термінами.`
  },
    {
      q: `Чи є доставка по ${cityName}?`,
      a: `У фільтрах можна обрати «Доставка» і бачити лише магазини з цією опцією; багато партнерів доставляють по місту.`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary uppercase">Запчастини</p>
        <h1 className="text-3xl font-bold">Магазини у місті {city.name_ua}</h1>
        <p className="text-neutral-600">Фільтруйте за брендом, категорією та доставкою.</p>
      </div>

      <Suspense fallback={<div className="text-neutral-600">Завантаження фільтрів...</div>}>
        <ShopFilters categories={categories} brands={brands} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        {partners.length === 0 && <Card>Немає магазинів за цими фільтрами.</Card>}
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/parts?city=${params.citySlug}`} />
        ))}
      </div>

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold">FAQ про запчастини у {cityName}</h3>
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
