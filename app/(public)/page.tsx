export const metadata = {
  title: "СТО та запчастини по Україні — знайди сервіс і деталі",
  description:
    "Каталог СТО та магазинів запчастин по всій Україні. Підбір за містом, послугою та маркою авто. Залишайте заявку — підберемо варіанти швидко.",
  keywords: [
    "сто україна",
    "автосервіс україна",
    "знайти сто",
    "ремонт авто",
    "запчастини україна",
    "магазин автозапчастин",
    "автозапчастини за містом",
    "запис на сто",
    "підбір сто за містом",
    "підбір автозапчастин",
    "підібрати запчастини по авто",
    "сто рейтинг"
  ]
};

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { SearchHero } from "@/components/shared/search-hero";
import { Card } from "@/components/ui/card";
import { getCities } from "@/lib/supabase/queries";

export default async function HomePage() {
  const cities = await getCities();
  const topCities = cities.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
      <SearchHero cities={cities} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярні міста</h2>
          <Link href="/cities" className="text-sm font-semibold text-primary">
            Усі міста
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {topCities.map((city) => (
            <Card key={city.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{city.name_ua}</p>
                <p className="text-sm text-neutral-600">{city.region_ua}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/${city.slug}/sto`} className="flex items-center gap-1 text-sm text-primary">
                  СТО <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/${city.slug}/shops`} className="flex items-center gap-1 text-sm text-primary">
                  Магазини <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-primary">Як працює</p>
          <h3 className="mt-2 text-xl font-bold">1. Оберіть місто</h3>
          <p className="text-neutral-600">Каталог активних партнерів, вказані послуги та категорії деталей.</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-primary">Заявка</p>
          <h3 className="mt-2 text-xl font-bold">2. Залишіть заявку</h3>
          <p className="text-neutral-600">Опишіть проблему або потрібну деталь. Додавайте фото.</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-primary">Результат</p>
          <h3 className="mt-2 text-xl font-bold">3. Отримайте дзвінок</h3>
          <p className="text-neutral-600">Партнери зв’яжуться напряму. Ви обираєте найкращу пропозицію.</p>
        </Card>
      </section>

      <section className="grid gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Для партнерів</p>
          <h3 className="text-2xl font-bold">Додайте свій сервіс чи магазин</h3>
          <p className="text-white/80">Отримуйте теплі ліди без зайвих витрат. Керуйте профілем у кабінеті.</p>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Link href="/register" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700">
            Стати партнером
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-white">
            Увійти в кабінет <MapPin className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
