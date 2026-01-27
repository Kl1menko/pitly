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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary uppercase">Запчастини</p>
        <h1 className="text-3xl font-bold">Магазини у місті {city.name_ua}</h1>
        <p className="text-neutral-600">Фільтруйте за брендом, категорією та доставкою.</p>
      </div>

      <ShopFilters categories={categories} brands={brands} />

      <div className="grid gap-4 md:grid-cols-2">
        {partners.length === 0 && <Card>Немає магазинів за цими фільтрами.</Card>}
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/parts?city=${params.citySlug}`} />
        ))}
      </div>
    </div>
  );
}
