import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { getCities } from "@/lib/supabase/queries";
import { getServiceCategoryBySlug, serviceCatalog } from "@/lib/services/catalog";
import { serviceCategories, taxonomyServices, taxonomyServicesBySlug } from "@/lib/services/taxonomy";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = taxonomyServicesBySlug.get(params.slug);
  if (service) {
    const category = service.categoryId ? serviceCategories.find((c) => c.id === service.categoryId) : null;
    return {
      title: `${service.name_ua} — знайти сервіс у місті | Pitly`,
      description: `Знайдіть послугу "${service.name_ua}" по містах України. ${category ? `${category.name}: ` : ""}каталог сервісів, підбір СТО та швидкий перехід до списку місць.`
    };
  }
  const category = getServiceCategoryBySlug(params.slug);
  if (!category) return { title: "Послуга не знайдена — Pitly" };
  return {
    title: `${category.title} — знайти сервіс у місті | Pitly`,
    description: category.description
  };
}

export function generateStaticParams() {
  const categoryParams = serviceCatalog.map((item) => ({ slug: item.slug }));
  const serviceParams = taxonomyServices.map((item) => ({ slug: item.slug }));
  const seen = new Set<string>();
  return [...categoryParams, ...serviceParams].filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export default async function ServiceCategoryPage({ params }: Props) {
  const service = taxonomyServicesBySlug.get(params.slug);
  if (service) {
    const cities = await getCities();
    const topCities = cities.slice(0, 18);
    const category = service.categoryId ? serviceCategories.find((c) => c.id === service.categoryId) : null;
    const faq = [
      {
        q: `Як знайти "${service.name_ua}" у своєму місті?`,
        a: `Оберіть місто зі списку нижче — відкриємо сторінку зі СТО, які надають послугу "${service.name_ua}", з фільтрами та рейтингом.`
      },
      {
        q: `Чи можна залишити заявку на "${service.name_ua}"?`,
        a: `Так. Ви можете перейти на сторінку міста, обрати СТО або залишити заявку на ремонт, і партнери надішлють пропозиції.`
      },
      {
        q: `Що робити, якщо потрібні ще суміжні роботи?`,
        a: `На сторінці міста можна швидко переключити послугу або категорію через фільтри та знайти СТО, які закривають задачу під ключ.`
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
            <Link href="/services" className="hover:text-neutral-900">Послуги</Link>
            {category && (
              <>
                <span>→</span>
                <Link href={`/services/${category.slug}`} className="hover:text-neutral-900">{category.name}</Link>
              </>
            )}
            <span>→</span>
            <span className="font-medium text-neutral-900">{service.name_ua}</span>
          </div>
          <p className="text-sm font-semibold uppercase text-neutral-500">Послуга</p>
          <h1 className="text-3xl font-bold text-neutral-900">{service.name_ua}</h1>
          <p className="max-w-3xl text-neutral-600">
            {category ? `${category.name}. ` : ""}Знайдіть СТО по містах України, які надають цю послугу, і швидко перейдіть до списку місць.
          </p>
        </div>

        <Card className="space-y-4 bg-white/90 ring-1 ring-neutral-200">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Знайти в моєму місті</h2>
            <p className="text-sm text-neutral-600">
              Відкрийте сторінку типу <code className="rounded bg-neutral-100 px-1 py-0.5">/{`{city}`}/services/{service.slug}</code> для реального списку місць.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {topCities.map((city) => (
              <Link
                key={city.id}
                href={`/${city.slug}/services/${service.slug}`}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                {city.name_ua}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
          <h3 className="text-lg font-bold text-neutral-900">FAQ: {service.name_ua}</h3>
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

  const category = getServiceCategoryBySlug(params.slug);
  if (!category) notFound();

  const cities = await getCities();
  const topCities = cities.slice(0, 18);
  const faq = [
    {
      q: `Як знайти "${category.title}" у своєму місті?`,
      a: `Оберіть місто, і ми відкриємо список СТО з фільтрами за послугами, брендом авто та додатковими параметрами.`
    },
    {
      q: `Чи можна перейти одразу до конкретної послуги?`,
      a: `Так. У фільтрі на сторінці міста виберіть конкретну послугу або скористайтесь сторінками виду /services/{service-slug}.`
    },
    {
      q: `Чи є на сторінках SEO-опис і FAQ?`,
      a: `Так, сторінки категорій і послуг мають унікальні title/description та FAQ-блок для кращої індексації.`
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
        <p className="text-sm font-semibold uppercase text-neutral-500">Послуги</p>
        <h1 className="text-3xl font-bold text-neutral-900">{category.title}</h1>
        <p className="max-w-3xl text-neutral-600">{category.description}</p>
      </div>

      <Card className="space-y-4 bg-white/90 ring-1 ring-neutral-200">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Знайти в моєму місті</h2>
          <p className="text-sm text-neutral-600">
            Оберіть місто і ми відкриємо реальний список місць з фільтрами для цієї послуги.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {topCities.map((city) => (
            <Link
              key={city.id}
              href={`/${city.slug}/services/${category.slug}`}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              {city.name_ua}
              {city.region_ua ? <span className="ml-1 text-xs font-normal text-neutral-500">({city.region_ua})</span> : null}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900">Як це працює</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">
          <li>Оберіть місто.</li>
          <li>Перегляньте список СТО/сервісів з фільтрами.</li>
          <li>Залиште заявку на ремонт або відкрийте профіль партнера.</li>
        </ol>
      </Card>

      <Card className="space-y-2 bg-white/90 ring-1 ring-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900">FAQ: {category.title}</h3>
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
