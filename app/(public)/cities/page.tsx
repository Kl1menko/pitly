import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getCities } from "@/lib/supabase/queries";

export const metadata = {
  title: "Міста України — каталог СТО та автопослуг",
  description: "Оберіть місто, щоб побачити СТО та автопослуги. Pitly працює у всіх обласних центрах."
};

function formatRegionLabel(region?: string | null) {
  if (!region) return "";
  const trimmed = region.trim();
  if (!trimmed) return "";
  if (/обл\.?$/i.test(trimmed)) return trimmed.replace(/обл$/i, "обл.");
  return `${trimmed} обл.`;
}

export default async function CitiesPage() {
  const cities = (await getCities()).filter((city) => city.slug !== "donetsk" && city.slug !== "luhansk");

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Міста</h1>
        <p className="text-neutral-600">Почніть з вибору міста — покажемо партнерів та приймемо заявку.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cities.map((city) => (
          <Card key={city.id} className="flex flex-col gap-2">
            <div>
              <p className="text-lg font-semibold">{city.name_ua}</p>
              <p className="text-sm text-neutral-600">{formatRegionLabel(city.region_ua)}</p>
            </div>
            <div className="mt-auto">
              <Link
                href={`/${city.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Переглянути <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
