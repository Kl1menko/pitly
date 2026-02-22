import Link from "next/link";

import { PartnerCard } from "@/components/cards/partner-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCityBySlug, getPartnersByCity } from "@/lib/supabase/queries";

export const metadata = {
  title: "Дякуємо! Заявку отримано",
  description: "Ми передали ваш запит партнерам. Очікуйте дзвінок."
};

type Props = {
  searchParams?: { city?: string; service?: string };
};

export default async function ThankYouPage({ searchParams }: Props) {
  const citySlug = typeof searchParams?.city === "string" ? searchParams.city : undefined;
  const serviceSlug = typeof searchParams?.service === "string" ? searchParams.service : undefined;
  const city = citySlug ? await getCityBySlug(citySlug) : null;
  const nearbyPartners = city
    ? await getPartnersByCity({
        type: "sto",
        cityId: city.id,
        filters: {
          services: serviceSlug ? [serviceSlug] : undefined,
          verified: true,
          sort: "rating"
        }
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4">
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-primary">Успіх</p>
        <h1 className="mt-2 text-3xl font-bold">Дякуємо! Заявку отримано</h1>
        <p className="mt-3 text-neutral-600">
          Ми передали інформацію партнерам{city ? ` у місті ${city.name_ua}` : ""}. Вони зв’яжуться найближчим часом.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href={city ? `/${city.slug}` : "/cities"}>Перейти в каталог</Link>
          </Button>
          <Button asChild>
            <Link href="/request/repair">Подати ще заявку</Link>
          </Button>
        </div>
      </div>

      <Card className="space-y-4 border border-neutral-200/90 bg-white/90">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase text-neutral-500">Поки чекаєте відповіді</p>
          <h2 className="text-xl font-bold text-neutral-900">Ось сервіси поруч</h2>
          <p className="text-sm text-neutral-600">
            {city
              ? `Можете також самостійно зв’язатися з сервісом у ${city.name_ua}, якщо хочете пришвидшити процес.`
              : "Оберіть місто в каталозі і зв’яжіться з сервісом напряму, якщо хочете пришвидшити процес."}
          </p>
        </div>
        {!city ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/cities">Обрати місто</Link>
            </Button>
            <Button asChild>
              <Link href="/services">Всі послуги</Link>
            </Button>
          </div>
        ) : nearbyPartners.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">Поки що не знайшли релевантні сервіси за обраними параметрами.</p>
            <Button asChild variant="outline">
              <Link href={`/${city.slug}`}>Відкрити каталог {city.name_ua}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {nearbyPartners.slice(0, 5).map((partner) => (
              <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/repair?city=${city.slug}&partner=${partner.slug}`} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
