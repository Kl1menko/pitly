"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CityPickerModal } from "@/components/shared/city-picker-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPreferredCitySlug, setPreferredCitySlug } from "@/lib/city/preference";
import { type City, type Service } from "@/lib/types";

export function ServicesDiscoveryPanel({ cities, services }: { cities: City[]; services: Service[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedServiceSlug, setSelectedServiceSlug] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingServiceSlug, setPendingServiceSlug] = useState<string | null>(null);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(getPreferredCitySlug());

  const selectedCity = selectedCitySlug ? cities.find((city) => city.slug === selectedCitySlug) : null;
  const popularServices = useMemo(
    () => services.filter((s) => s.isPopular).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).slice(0, 10),
    [services]
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return services
      .filter((service) => [service.name_ua, service.slug, ...(service.keywords ?? [])].join(" ").toLowerCase().includes(q))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 8);
  }, [query, services]);

  const goToService = (serviceSlug?: string | null) => {
    const slug = serviceSlug || selectedServiceSlug;
    if (!slug) return;
    const citySlug = selectedCitySlug || getPreferredCitySlug();
    if (!citySlug) {
      setPendingServiceSlug(slug);
      setModalOpen(true);
      return;
    }
    router.push(`/${citySlug}/services/${slug}`);
  };

  return (
    <>
      <Card className="space-y-4 border border-neutral-200/90 bg-white/90 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase text-neutral-500">Швидкий підбір послуги</p>
          <h2 className="text-xl font-bold text-neutral-900">Яка послуга потрібна?</h2>
          <p className="text-sm text-neutral-600">
            Оберіть послугу, а ми відкриємо список сервісів у {selectedCity ? `місті ${selectedCity.name_ua}` : "вашому місті"}.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Напр. полірування, шиномонтаж, діагностика..."
          />
          <Button type="button" variant="outline" onClick={() => setModalOpen(true)}>
            {selectedCity ? selectedCity.name_ua : "Оберіть місто"}
          </Button>
          <Button type="button" onClick={() => goToService()}>
            Знайти
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setSelectedServiceSlug(service.slug);
                  setQuery(service.name_ua);
                  goToService(service.slug);
                }}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left hover:border-neutral-300"
              >
                <p className="text-sm font-semibold text-neutral-900">{service.name_ua}</p>
                <p className="text-xs text-neutral-500">{service.slug}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {popularServices.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                setSelectedServiceSlug(service.slug);
                setQuery(service.name_ua);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                selectedServiceSlug === service.slug
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              {service.name_ua}
            </button>
          ))}
        </div>
      </Card>

      <CityPickerModal
        cities={cities}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Оберіть місто для пошуку послуг"
        onSelect={(city) => {
          setPreferredCitySlug(city.slug);
          setSelectedCitySlug(city.slug);
          setModalOpen(false);
          if (pendingServiceSlug) {
            const next = pendingServiceSlug;
            setPendingServiceSlug(null);
            router.push(`/${city.slug}/services/${next}`);
          }
        }}
      />
    </>
  );
}
