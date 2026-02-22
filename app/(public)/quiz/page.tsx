import Link from "next/link";
import type { Metadata } from "next";

import { ProblemQuizWizard } from "@/components/forms/problem-quiz-wizard";
import { PartnerCard } from "@/components/cards/partner-card";
import { Card } from "@/components/ui/card";
import { getBrands, getCityBySlug, getPartnersByCity, getServices } from "@/lib/supabase/queries";
import { getQuizSymptom } from "@/lib/services/problem-quiz";
import { getCities } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Швидкий підбір за проблемою — Pitly",
  description: "Опишіть симптоми і отримайте підказку, до якого сервісу звернутись, плюс список майстрів у вашому місті."
};

type Props = {
  searchParams?: { symptom?: string; city?: string; detail?: string; brand?: string };
};

export default async function QuizPage({ searchParams }: Props) {
  const [cities, brands, services] = await Promise.all([getCities(), getBrands(), getServices()]);
  const symptom = getQuizSymptom(searchParams?.symptom);
  const city = searchParams?.city ? await getCityBySlug(searchParams.city) : null;
  const recommendedServices = symptom ? services.filter((s) => symptom.serviceSlugs.includes(s.slug)).slice(0, 3) : [];
  const partners =
    city && symptom
      ? await getPartnersByCity({
          type: "sto",
          cityId: city.id,
          filters: {
            services: symptom.serviceSlugs,
            brand: typeof searchParams?.brand === "string" ? searchParams.brand : undefined,
            sort: "rating"
          }
        })
      : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-neutral-500">Beta</p>
        <h1 className="text-3xl font-bold text-neutral-900">Швидкий підбір за проблемою</h1>
        <p className="max-w-3xl text-neutral-600">
          Опишіть симптоми, і ми підкажемо ймовірно потрібні послуги та покажемо релевантні сервіси поруч.
        </p>
      </div>

      <ProblemQuizWizard
        cities={cities}
        brands={brands}
        initial={{
          symptom: typeof searchParams?.symptom === "string" ? searchParams.symptom : "",
          city: typeof searchParams?.city === "string" ? searchParams.city : "",
          detail: typeof searchParams?.detail === "string" ? searchParams.detail : "",
          brand: typeof searchParams?.brand === "string" ? searchParams.brand : ""
        }}
      />

      {symptom && city && (
        <>
          <Card className="space-y-4 border border-amber-200 bg-amber-50/70">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Результат</p>
              <h2 className="text-xl font-bold text-neutral-900">Ймовірно потрібні послуги</h2>
              <p className="text-sm text-neutral-700">
                Місто: <span className="font-semibold">{city.name_ua}</span>. Це навігаційна підказка, а не точний діагноз.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/${city.slug}/services/${service.slug}`}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  {service.name_ua}
                </Link>
              ))}
              <Link href={`/request/repair?city=${city.slug}`} className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white">
                Подати заявку
              </Link>
            </div>
            {searchParams?.detail ? (
              <p className="text-xs text-neutral-600">
                Ваш опис: <span className="font-medium">{searchParams.detail}</span>
              </p>
            ) : null}
          </Card>

          <Card className="space-y-4 border border-neutral-200/90 bg-white/90">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Майстри поруч</h2>
                <p className="text-sm text-neutral-600">Пріоритетно за релевантністю послуг та рейтингом.</p>
              </div>
              <Link href={`/request/repair?city=${city.slug}`} className="text-sm font-semibold text-neutral-900 underline">
                Не знайшов? Подати заявку
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {partners.slice(0, 6).map((partner) => (
                <PartnerCard key={partner.id} partner={partner} ctaHref={`/request/repair?city=${city.slug}&partner=${partner.slug}`} />
              ))}
              {partners.length === 0 ? (
                <Card>
                  За цими параметрами партнерів не знайдено. Спробуйте інший симптом або одразу подайте заявку на ремонт.
                </Card>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
