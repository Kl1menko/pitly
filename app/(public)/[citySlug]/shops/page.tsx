import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PartnerCard } from "@/components/cards/partner-card";
import { ShopFilters } from "@/components/filters/shop-filters";
import { ResultsPagination } from "@/components/shared/results-pagination";
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
  const pageParam = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const perPage = 20;

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
  const totalPages = Math.max(1, Math.ceil(partners.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedPartners = partners.slice((safePage - 1) * perPage, safePage * perPage);

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

      <Card className="bg-white/90 ring-1 ring-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-neutral-900">Знайдено {partners.length} магазинів</p>
          <p className="text-neutral-600">
            {partners.length > 0
              ? `${(safePage - 1) * perPage + 1}-${Math.min(safePage * perPage, partners.length)} з ${partners.length} • сторінка ${safePage} з ${totalPages}`
              : `Сторінка ${safePage} з ${totalPages}`}
          </p>
        </div>
      </Card>

      <div className="grid min-h-[240px] content-start gap-4 md:grid-cols-2">
        {partners.length === 0 && (
          <Card className="md:col-span-2 flex min-h-[220px] items-center justify-center border-dashed text-center bg-neutral-50/80">
            <div className="max-w-xl space-y-2">
              <p className="text-lg font-semibold text-neutral-900">Немає магазинів за цими фільтрами</p>
              <p className="text-sm text-neutral-700">Змініть категорії, бренд або інші параметри фільтрації.</p>
            </div>
          </Card>
        )}
        {paginatedPartners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/parts?city=${params.citySlug}`} />
        ))}
      </div>

      <ResultsPagination pathname={`/${params.citySlug}/shops`} searchParams={searchParams} page={safePage} totalPages={totalPages} />

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
