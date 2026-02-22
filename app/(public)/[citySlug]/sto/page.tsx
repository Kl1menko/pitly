import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { PartnerCard } from "@/components/cards/partner-card";
import { StoFilters } from "@/components/filters/partner-filters";
import { Card } from "@/components/ui/card";
import { getBrands, getCityBySlug, getPartnersByCity, getServices } from "@/lib/supabase/queries";
import { serviceCategories } from "@/lib/services/taxonomy";

type Props = {
  params: { citySlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: { params: { citySlug: string } }): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);
  const cityName = city?.name_ua ?? "місті";
  return {
    title: `СТО в ${cityName} — автосервіси, ремонт авто, ціни та контакти`,
    description: `Потрібне СТО в ${cityName}? Каталог автосервісів з фільтрами за послугами, маркою авто та районом. Оберіть сервіс або залиште заявку на ремонт.`,
    keywords: [
      `сто ${cityName}`,
      `автосервіс ${cityName}`,
      `ремонт авто ${cityName}`,
      `сто поруч ${cityName}`,
      `запис на сто ${cityName}`
    ]
  };
}

export default async function StoCityPage({ params, searchParams }: Props) {
  const city = await getCityBySlug(params.citySlug);
  if (!city) return notFound();

  const services = await getServices();
  const brands = await getBrands();
  const cityName = city.name_ua;
  const explicitServices = typeof searchParams.services === "string" ? searchParams.services.split(",").filter(Boolean) : undefined;
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const category = categorySlug ? serviceCategories.find((c) => c.slug === categorySlug) : undefined;
  const categoryServices = !explicitServices?.length && category ? services.filter((s) => s.categoryId === category.id).map((s) => s.slug) : undefined;
  const selectedServices = explicitServices?.length ? explicitServices : categoryServices;
  const primaryService = selectedServices?.[0] ? services.find((s) => s.slug === selectedServices[0]) : undefined;
  const primaryServiceCategory =
    primaryService?.categoryId ? serviceCategories.find((c) => c.id === primaryService.categoryId) : category;

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

  const faq = [
    {
      q: `Де знайти СТО у ${cityName}?`,
      a: `На Pitly зібрані перевірені сервісні станції у ${cityName}, можна відфільтрувати за послугами та маркою авто.`
    },
  {
    q: `Скільки коштує ремонт ходової у ${cityName}?`,
    a: `Ціна залежить від діагностики та деталей. Подайте заявку — партнери у ${cityName} надішлють пропозиції з ціною і термінами.`
  },
    {
      q: `Як записатись на СТО у ${cityName}?`,
      a: `Обирайте сервіс за рейтингом або залишайте заявку «Заявка на ремонт» — ми передамо її активним СТО у ${cityName}.`
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <Link href="/cities" className="hover:text-neutral-900">Міста</Link>
          <span>→</span>
          <span className="text-neutral-700">{city.name_ua}</span>
          {primaryServiceCategory && (
            <>
              <span>→</span>
              <span className="text-neutral-700">{primaryServiceCategory.name}</span>
            </>
          )}
          {primaryService && (
            <>
              <span>→</span>
              <span className="font-medium text-neutral-900">{primaryService.name_ua}</span>
            </>
          )}
        </div>
        <p className="text-sm font-semibold text-primary uppercase">СТО</p>
        <h1 className="text-3xl font-bold">СТО у місті {city.name_ua}</h1>
        <p className="text-neutral-600">Активні партнери, які приймають заявки онлайн.</p>
      </div>

      <Suspense fallback={<div className="text-neutral-600">Завантаження фільтрів...</div>}>
        <StoFilters services={services} brands={brands} defaultCategorySlug={categorySlug} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        {partners.length === 0 && <Card>Немає партнерів за цими фільтрами. Спробуйте змінити пошук.</Card>}
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            ctaHref={`/request/repair?city=${params.citySlug}&partner=${partner.slug}`}
          />
        ))}
      </div>

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold">FAQ про СТО у {cityName}</h3>
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
