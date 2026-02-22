import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { PartnerCard } from "@/components/cards/partner-card";
import { StoFilters } from "@/components/filters/partner-filters";
import { Card } from "@/components/ui/card";
import { getBrands, getCityBySlug, getPartnersByCity, getServices } from "@/lib/supabase/queries";
import { getServiceCategoryBySlug } from "@/lib/services/catalog";
import { serviceCategories, taxonomyServicesBySlug } from "@/lib/services/taxonomy";

type Props = {
  params: { citySlug: string; slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

function parseSearchServices(searchParams: Props["searchParams"]) {
  return typeof searchParams.services === "string" ? searchParams.services.split(",").filter(Boolean) : undefined;
}

export async function generateMetadata({ params }: { params: { citySlug: string; slug: string } }): Promise<Metadata> {
  const [city, category] = await Promise.all([getCityBySlug(params.citySlug), Promise.resolve(getServiceCategoryBySlug(params.slug))]);
  const cityName = city?.name_ua ?? "вашому місті";
  const service = taxonomyServicesBySlug.get(params.slug);
  if (service) {
    return {
      title: `${service.name_ua} у ${cityName} — СТО, ціни, контакти | Pitly`,
      description: `Знайдіть "${service.name_ua}" у ${cityName}: список СТО з фільтрами, рейтингом, перевіркою та опціями сервісу.`
    };
  }
  const serviceName = category?.title ?? "послуга";

  return {
    title: `${serviceName} у ${cityName} — каталог сервісів | Pitly`,
    description: `Знайдіть ${serviceName.toLowerCase()} у ${cityName}. Список місць з фільтрами за брендом, рейтингом та верифікацією.`
  };
}

export default async function CityServiceListPage({ params, searchParams }: Props) {
  const categoryFromQuery = typeof searchParams.category === "string" ? searchParams.category : params.slug;
  if (categoryFromQuery && categoryFromQuery !== params.slug) {
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "category" || typeof value !== "string") continue;
      nextParams.set(key, value);
    }
    const query = nextParams.toString();
    redirect(`/${params.citySlug}/services/${categoryFromQuery}${query ? `?${query}` : ""}`);
  }

  const city = await getCityBySlug(params.citySlug);
  const category = getServiceCategoryBySlug(params.slug);
  const routeService = taxonomyServicesBySlug.get(params.slug);
  if (!city || (!category && !routeService)) return notFound();

  const [services, brands] = await Promise.all([getServices(), getBrands()]);

  const explicitServices = parseSearchServices(searchParams);
  const routeCategoryMeta = routeService?.categoryId ? serviceCategories.find((c) => c.id === routeService.categoryId) : serviceCategories.find((c) => c.slug === params.slug);
  const queryCategoryMeta = serviceCategories.find((c) => c.slug === categoryFromQuery);
  const categoryServices =
    !explicitServices?.length && queryCategoryMeta ? services.filter((s) => s.categoryId === queryCategoryMeta.id).map((s) => s.slug) : undefined;
  const routeServiceSlug = routeService ? routeService.slug : undefined;
  const fallbackServices = routeServiceSlug
    ? [routeServiceSlug]
    : categoryServices && categoryServices.length > 0
      ? categoryServices
      : category && category.serviceSlugs.length > 0
        ? category.serviceSlugs
        : undefined;
  const selectedServices = explicitServices && explicitServices.length > 0 ? explicitServices : fallbackServices;
  const primaryService = selectedServices?.[0] ? services.find((s) => s.slug === selectedServices[0]) : undefined;

  const partners = await getPartnersByCity({
    type: "sto",
    cityId: city.id,
    filters: {
      q: typeof searchParams.q === "string" ? searchParams.q : undefined,
      services: selectedServices,
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

  const pageTitle = routeService ? `${routeService.name_ua} у ${city.name_ua}` : `${category?.title ?? "Послуги"} у ${city.name_ua}`;
  const pageDescription = routeService
    ? `Реальний список місць у вибраному місті для послуги "${routeService.name_ua}". Можна уточнити бренд авто, рейтинг та інші параметри.`
    : "Реальний список місць у вибраному місті з фільтрами. Можна уточнити бренд авто, рейтинг або інші послуги.";

  const faq = routeService
    ? [
        {
          q: `Де знайти "${routeService.name_ua}" у ${city.name_ua}?`,
          a: `На цій сторінці зібрані СТО у ${city.name_ua}, які надають послугу "${routeService.name_ua}". Використовуйте фільтри за брендом, рейтингом і додатковими параметрами.`
        },
        {
          q: `Як швидко обрати СТО для "${routeService.name_ua}" у ${city.name_ua}?`,
          a: `Почніть з послуги, далі відфільтруйте перевірені СТО або СТО з запчастинами, і відкрийте профіль або залиште заявку на ремонт.`
        },
        {
          q: `Чи можна знайти СТО, яке також підбере запчастини для "${routeService.name_ua}"?`,
          a: `Так, увімкніть фільтр "Є запчастини", щоб бачити СТО, які можуть закрити роботу і деталі під ключ.`
        }
      ]
    : [
        {
          q: `Як знайти ${category?.title?.toLowerCase() ?? "послугу"} у ${city.name_ua}?`,
          a: `Оберіть конкретну послугу у фільтрі, перевірте рейтинг та додаткові параметри, після чого відкрийте картку СТО або залиште заявку.`
        },
        {
          q: `Чи працює пошук по послугах у ${city.name_ua}?`,
          a: `Так, фільтр підтримує автопідказки, популярні чіпи та відбір за категорією послуг.`
        },
        {
          q: `Чи можна вибрати СТО з запчастинами у ${city.name_ua}?`,
          a: `Так, увімкніть фільтр "Є запчастини", щоб бачити СТО, які можуть закривати ремонт і деталі під ключ.`
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
          <Link href="/cities" className="hover:text-neutral-900">Міста</Link>
          <span>→</span>
          <span className="text-neutral-700">{city.name_ua}</span>
          <span>→</span>
          <span className="text-neutral-700">{routeCategoryMeta?.name ?? category?.title ?? "Послуги"}</span>
          {primaryService && (
            <>
              <span>→</span>
              <span className="font-medium text-neutral-900">{primaryService.name_ua}</span>
            </>
          )}
        </div>
        <p className="text-sm font-semibold uppercase text-neutral-500">Послуги у місті</p>
        <h1 className="text-3xl font-bold text-neutral-900">{pageTitle}</h1>
        <p className="text-neutral-600">{pageDescription}</p>
      </div>

      <Card className="bg-blue-50/70 ring-1 ring-blue-100">
        <p className="text-sm text-blue-900">
          Обрана категорія: <span className="font-semibold">{routeCategoryMeta?.name ?? category?.title ?? "Послуги"}</span>
          {selectedServices?.length ? ` • застосовано ${selectedServices.length} сервісних фільтрів` : ""}
        </p>
      </Card>

      <Suspense fallback={<div className="text-neutral-600">Завантаження фільтрів...</div>}>
        <StoFilters services={services} brands={brands} defaultCategorySlug={params.slug} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        {partners.length === 0 && (
          <Card>
            Немає партнерів за цією послугою у місті {city.name_ua}. Спробуйте змінити фільтри або залиште заявку на ремонт.
          </Card>
        )}
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            ctaHref={`/request/repair?city=${params.citySlug}&partner=${partner.slug}`}
          />
        ))}
      </div>

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900">FAQ: {pageTitle}</h3>
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
