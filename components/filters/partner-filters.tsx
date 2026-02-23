"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { type CarBrand, type Service } from "@/lib/types";
import { serviceCategories } from "@/lib/services/taxonomy";

function useQueryArray(param: string, searchParams: URLSearchParams) {
  const raw = searchParams.get(param);
  return raw ? raw.split(",").filter(Boolean) : [];
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/ь/g, "")
    .replace(/ы/g, "и")
    .replace(/ё/g, "е")
    .replace(/э/g, "е")
    .replace(/ї/g, "і")
    .replace(/є/g, "е")
    .replace(/ґ/g, "г")
    .replace(/й/g, "и")
    .replace(/\s+/g, " ")
    .trim();
}

function serviceMatchesQuery(service: Service, qRaw: string, qNorm: string, categoryLabel?: string) {
  const rawHay = [service.name_ua, service.slug, ...(service.keywords ?? []), categoryLabel ?? ""].join(" ").toLowerCase();
  if (qRaw && rawHay.includes(qRaw)) return true;
  const normHay = normalizeSearchText(rawHay);
  if (qNorm && normHay.includes(qNorm)) return true;
  return false;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, idx) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={`${part}-${idx}`} className="rounded bg-amber-100 px-0.5 text-neutral-900">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    )
  );
}

export function StoFilters({
  services,
  brands,
  defaultCategorySlug
}: {
  services: Service[];
  brands: CarBrand[];
  defaultCategorySlug?: string;
}) {
  const rawSearchParams = useSearchParams();
  const searchParamsString = rawSearchParams?.toString() ?? "";
  const searchParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState(searchParams.get("q") ?? "");

  const activeServices = useQueryArray("services", searchParams);
  const activeService = activeServices[0] ?? "";
  const activeCategory = searchParams.get("category") ?? defaultCategorySlug ?? "";
  const activeQuery = searchParams.get("q") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const verified = searchParams.get("verified") === "1";
  const partsSales = searchParams.get("parts") === "1";
  const onlineBooking = searchParams.get("online") === "1";
  const openToday = searchParams.get("today") === "1";
  const openNow = searchParams.get("openNow") === "1";
  const evac = searchParams.get("evac") === "1";
  const sort = searchParams.get("sort") ?? "";

  const categoryOptions = useMemo(
    () =>
      serviceCategories
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((cat) => ({ slug: cat.slug, label: cat.name, id: cat.id })),
    []
  );

  const serviceBySlug = useMemo(() => new Map(services.map((s) => [s.slug, s])), [services]);

  const servicesFilteredByCategory = useMemo(() => {
    const selectedCategory = categoryOptions.find((c) => c.slug === activeCategory);
    if (!selectedCategory) return services;
    return services.filter((s) => s.categoryId === selectedCategory.id);
  }, [services, categoryOptions, activeCategory]);

  const popularServices = useMemo(() => {
    return servicesFilteredByCategory
      .filter((s) => s.isPopular)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 8);
  }, [servicesFilteredByCategory]);

  const serviceSuggestionsInCategory = useMemo(() => {
    const qRaw = serviceQuery.trim().toLowerCase();
    const qNorm = normalizeSearchText(serviceQuery);
    if (!qNorm && !qRaw) return [];
    return servicesFilteredByCategory
      .filter((s) => serviceMatchesQuery(s, qRaw, qNorm, categoryOptions.find((c) => c.id === s.categoryId)?.label))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 8);
  }, [serviceQuery, servicesFilteredByCategory, categoryOptions]);

  const serviceSuggestionsGlobal = useMemo(() => {
    const qRaw = serviceQuery.trim().toLowerCase();
    const qNorm = normalizeSearchText(serviceQuery);
    if (!qNorm && !qRaw) return [];
    return services
      .filter((s) => serviceMatchesQuery(s, qRaw, qNorm, categoryOptions.find((c) => c.id === s.categoryId)?.label))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 8);
  }, [serviceQuery, services, categoryOptions]);

  const serviceSuggestions = serviceSuggestionsInCategory.length > 0 ? serviceSuggestionsInCategory : serviceSuggestionsGlobal;
  const serviceQueryHasText = serviceQuery.trim().length > 0;
  const foundOnlyOutsideCategory =
    Boolean(activeCategory) && serviceQueryHasText && serviceSuggestionsInCategory.length === 0 && serviceSuggestionsGlobal.length > 0;
  const noServiceMatches = serviceQuery.trim().length >= 2 && serviceSuggestionsGlobal.length === 0;

  useEffect(() => {
    setCatalogQuery(new URLSearchParams(searchParamsString).get("q") ?? "");
  }, [searchParamsString]);

  const apply = (next: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(href, { scroll: false });
      router.refresh();
    });
  };

  const resetAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
      router.refresh();
    });
    setServiceQuery("");
    setCatalogQuery("");
  };

  const toggleService = (slug: string) => {
    const current = activeServices[0];
    const nextSlug = current === slug ? null : slug;
    const selectedService = nextSlug ? serviceBySlug.get(nextSlug) : null;
    const categorySlug =
      selectedService?.categoryId
        ? categoryOptions.find((c) => c.id === selectedService.categoryId)?.slug ?? null
        : null;
    apply({ services: nextSlug ? [nextSlug] : null, category: categorySlug });
    setServiceQuery("");
  };

  const setCategory = (categorySlug: string) => {
    apply({ category: categorySlug || null, services: null });
  };

  const panel = (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-800">Пошук по каталогу</p>
        <div className="mt-2 flex gap-2">
          <input
            value={catalogQuery}
            onChange={(e) => setCatalogQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply({ q: catalogQuery.trim() || null });
              }
            }}
            placeholder="Назва сервісу, район, адреса..."
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-500"
          />
          <Button type="button" variant="outline" onClick={() => apply({ q: catalogQuery.trim() || null })}>
            Знайти
          </Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800">Послуга</p>
        <div className="mt-2 space-y-2">
          <input
            value={serviceQuery}
            onChange={(e) => setServiceQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && serviceSuggestions[0]) {
                e.preventDefault();
                toggleService(serviceSuggestions[0].slug);
              }
            }}
            placeholder="Напр. полірування, діагностика, шиномонтаж"
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-500"
          />
          {foundOnlyOutsideCategory && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              У вибраній категорії збігів немає. Показуємо результати з інших категорій.
            </div>
          )}
          {noServiceMatches && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
              Нічого не знайдено. Спробуйте іншу назву або ключове слово (наприклад: діагностика, шиномонтаж, полірування).
            </div>
          )}
          {serviceSuggestions.length > 0 && (
            <div className="rounded-2xl border border-neutral-300 bg-neutral-50/80 p-2">
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Підказки послуг
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
              {serviceSuggestions.map((service) => (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => toggleService(service.slug)}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-900/15"
                >
                  <div className="font-semibold">{highlightMatch(service.name_ua, serviceQuery)}</div>
                  {service.categoryId && (
                    <div className="text-xs font-medium text-neutral-600">
                      {categoryOptions.find((c) => c.id === service.categoryId)?.label}
                    </div>
                  )}
                </button>
              ))}
            </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {popularServices.map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => toggleService(service.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  activeService === service.slug
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                {service.name_ua}
              </button>
            ))}
          </div>
          {activeService && (
            <div className="text-xs text-neutral-600">
              Обрана послуга: <span className="font-semibold text-neutral-900">{serviceBySlug.get(activeService)?.name_ua ?? activeService}</span>
              <button type="button" className="ml-2 underline" onClick={() => apply({ services: null })}>
                скинути
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-neutral-800">Категорія</p>
          <Select value={activeCategory} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Усі категорії</option>
            {categoryOptions.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">Марка авто</p>
          <Select value={activeBrand} onChange={(e) => apply({ brand: e.target.value || null })}>
            <option value="">Будь-яка</option>
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Checkbox checked={verified} onChange={(e) => apply({ verified: e.target.checked ? "1" : null })} />
          Перевірені
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Checkbox checked={partsSales} onChange={(e) => apply({ parts: e.target.checked ? "1" : null })} />
          СТО з запчастинами
        </label>
        <div>
          <p className="text-sm font-semibold text-neutral-800">Сортування</p>
          <Select value={sort} onChange={(e) => apply({ sort: e.target.value || null })}>
            <option value="">За замовчуванням</option>
            <option value="rating">Рейтинг</option>
            <option value="new">Нові</option>
          </Select>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-neutral-200 p-3">
        <p className="text-sm font-semibold text-neutral-800">Додатково</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <Checkbox checked={onlineBooking} onChange={(e) => apply({ online: e.target.checked ? "1" : null })} />
            Онлайн-запис
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <Checkbox checked={openToday} onChange={(e) => apply({ today: e.target.checked ? "1" : null })} />
            Сьогодні працює
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <Checkbox checked={openNow} onChange={(e) => apply({ openNow: e.target.checked ? "1" : null })} />
            Працює зараз
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <Checkbox checked={evac} onChange={(e) => apply({ evac: e.target.checked ? "1" : null })} />
            Виїзд / евакуатор
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Каталог</p>
          <h3 className="text-lg font-bold text-neutral-900">Фільтри</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={resetAll} className="hidden md:inline-flex">
            Скинути
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Налаштувати
          </Button>
        </div>
      </div>
      {isPending && <div className="text-xs font-semibold text-neutral-500">Оновлюємо результати...</div>}
      <div className="hidden md:block">{panel}</div>
      {open && <div className="md:hidden">{panel}</div>}
      <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
        <Filter className="h-4 w-4" />
        Активно: {activeService ? "1 послуга" : "послуга не обрана"}, {activeCategory ? `категорія ${activeCategory}` : "усі категорії"},{" "}
        {activeBrand ? `бренд ${activeBrand}` : "будь-яка марка"}
        {activeQuery ? `, пошук: ${activeQuery}` : ""}
        {partsSales ? ", СТО з запчастинами" : ""}
        {onlineBooking ? ", онлайн-запис" : ""}
        {openNow ? ", працює зараз" : openToday ? ", сьогодні працює" : ""}
        {evac ? ", виїзд/евакуатор" : ""}
      </div>
    </div>
  );
}
