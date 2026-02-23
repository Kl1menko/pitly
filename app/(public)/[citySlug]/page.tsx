import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PartnerCard } from "@/components/cards/partner-card";
import { StoFilters } from "@/components/filters/partner-filters";
import { ResultsPagination } from "@/components/shared/results-pagination";
import { Card } from "@/components/ui/card";
import { getBrands, getCityBySlug, getPartnersByCity, getServices } from "@/lib/supabase/queries";
import { serviceCategories } from "@/lib/services/taxonomy";

type Props = {
  params: { citySlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

function parseServices(searchParams: Props["searchParams"]) {
  return typeof searchParams.services === "string" ? searchParams.services.split(",").filter(Boolean) : undefined;
}

export async function generateMetadata({ params }: { params: { citySlug: string } }): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);
  const cityName = city?.name_ua ?? "місті";
  return {
    title: `Каталог автосервісів у ${cityName} — СТО, детейлінг, шиномонтаж | Pitly`,
    description: `Каталог перевірених автосервісів у ${cityName}: СТО, детейлінг, шиномонтаж та інші послуги. Пошук по послугах, району, рейтингу та опціях сервісу.`
  };
}

export default async function CityCatalogPage({ params, searchParams }: Props) {
  const city = await getCityBySlug(params.citySlug);
  if (!city) return notFound();
  const pageParam = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const perPage = 20;

  const [services, brands] = await Promise.all([getServices(), getBrands()]);
  const explicitServices = parseServices(searchParams);
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const category = categorySlug ? serviceCategories.find((c) => c.slug === categorySlug) : undefined;
  const selectedServices = explicitServices?.length ? explicitServices : undefined;
  const primaryService = selectedServices?.[0] ? services.find((s) => s.slug === selectedServices[0]) : undefined;
  const primaryCategory =
    primaryService?.categoryId ? serviceCategories.find((c) => c.id === primaryService.categoryId) : category;

  const partners = await getPartnersByCity({
    type: "sto",
    cityId: city.id,
    filters: {
      q: typeof searchParams.q === "string" ? searchParams.q : undefined,
      services: selectedServices,
      category: !explicitServices?.length ? category?.id : undefined,
      brand: typeof searchParams.brand === "string" ? searchParams.brand : undefined,
      verified: searchParams.verified === "1",
      partsSalesEnabled: searchParams.parts === "1",
      onlineBooking: searchParams.online === "1",
      openToday: searchParams.today === "1",
      openNow: searchParams.openNow === "1",
      evacOrMobile: searchParams.evac === "1",
      sort: searchParams.sort === "rating" ? "rating" : undefined
    }
  });
  const totalPages = Math.max(1, Math.ceil(partners.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedPartners = partners.slice((safePage - 1) * perPage, safePage * perPage);

  const faq = [
    {
      q: `Як швидко знайти сервіс у ${city.name_ua}?`,
      a: `Почніть з пошуку по каталогу або виберіть послугу у фільтрі. Далі уточніть бренд авто, рейтинг та додаткові опції сервісу.`
    },
    {
      q: `Чи можна знайти СТО з онлайн-записом або евакуатором у ${city.name_ua}?`,
      a: `Так, використовуйте додаткові фільтри: онлайн-запис, працює зараз/сьогодні, виїзд/евакуатор та СТО з запчастинами.`
    },
    {
      q: `Що робити, якщо не знайшов потрібний сервіс?`,
      a: `Залиште заявку на ремонт — партнери в місті надішлють пропозиції, а ви оберете найзручніший варіант.`
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <Link href="/cities" className="hover:text-neutral-900">
            Міста
          </Link>
          <span>→</span>
          <span className="text-neutral-700">{city.name_ua}</span>
          {primaryCategory && (
            <>
              <span>→</span>
              <span className="text-neutral-700">{primaryCategory.name}</span>
            </>
          )}
          {primaryService && (
            <>
              <span>→</span>
              <span className="font-medium text-neutral-900">{primaryService.name_ua}</span>
            </>
          )}
        </div>
        <p className="text-sm font-semibold uppercase text-neutral-500">Каталог сервісів</p>
        <h1 className="text-3xl font-bold text-neutral-900">{city.name_ua}: СТО, детейлінг, шиномонтаж та інші послуги</h1>
        <p className="text-neutral-600">
          Перевірені автосервіси у місті {city.name_ua}. Шукайте по послугах, району, рейтингу та опціях сервісу.
        </p>
      </div>

      <Card className="bg-neutral-900 text-white">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Швидкий шлях</p>
            <p className="mt-1 text-lg font-semibold">Місто → послуга → список місць</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Заявка</p>
            <p className="mt-1 text-sm text-white/85">Не знайшли варіант? Подайте заявку на ремонт і отримайте пропозиції від партнерів.</p>
          </div>
          <div className="flex items-center md:justify-end">
            <Link href={`/request/repair?city=${params.citySlug}`} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-neutral-900">
              Подати заявку
            </Link>
          </div>
        </div>
      </Card>

      <Suspense fallback={<div className="text-neutral-600">Завантаження фільтрів...</div>}>
        <StoFilters services={services} brands={brands} defaultCategorySlug={categorySlug} />
      </Suspense>

      <Card className="bg-white/90 ring-1 ring-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-neutral-900">Знайдено {partners.length} сервісів</p>
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
              <p className="text-lg font-semibold text-neutral-900">Нічого не знайдено за цими фільтрами</p>
              <p className="text-sm text-neutral-700">
                У місті {city.name_ua} зараз немає сервісів за вибраними параметрами. Спробуйте змінити фільтри або подайте заявку на ремонт.
              </p>
            </div>
          </Card>
        )}
        {paginatedPartners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/repair?city=${params.citySlug}&partner=${partner.slug}`} />
        ))}
      </div>

      <ResultsPagination pathname={`/${params.citySlug}`} searchParams={searchParams} page={safePage} totalPages={totalPages} />

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h2 className="text-lg font-bold text-neutral-900">FAQ: Каталог сервісів у {city.name_ua}</h2>
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
