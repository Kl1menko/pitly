"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type City } from "@/lib/types";

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * r * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

export function CityPickerModal({
  cities,
  open,
  onClose,
  onSelect,
  title = "Оберіть місто"
}: {
  cities: City[];
  open: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setGeoError(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => [city.name_ua, city.region_ua ?? "", city.slug].join(" ").toLowerCase().includes(q));
  }, [cities, query]);

  const popularCities = cities.slice(0, 8);

  if (!open) return null;

  const detectNearest = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Геолокація недоступна у браузері");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const candidate = cities
          .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
          .map((c) => ({ city: c, d: distanceKm(latitude, longitude, c.lat as number, c.lng as number) }))
          .sort((a, b) => a.d - b.d)[0];
        setGeoLoading(false);
        if (!candidate) {
          setGeoError("Не вдалося визначити найближче місто");
          return;
        }
        onSelect(candidate.city);
      },
      () => {
        setGeoLoading(false);
        setGeoError("Доступ до геолокації не надано");
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Місто</p>
            <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Пошук міста..." />
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelect(city)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                {city.name_ua}
              </button>
            ))}
            <button
              type="button"
              onClick={detectNearest}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
              disabled={geoLoading}
            >
              <MapPin className="h-4 w-4" />
              {geoLoading ? "Шукаємо..." : "Визначити по гео"}
            </button>
          </div>
          {geoError ? <p className="text-xs text-red-600">{geoError}</p> : null}
        </div>

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-neutral-200 p-2">
          {filtered.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelect(city)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-neutral-50"
            >
              <span className="font-semibold text-neutral-900">{city.name_ua}</span>
              <span className="text-xs text-neutral-500">{city.region_ua || city.slug}</span>
            </button>
          ))}
          {filtered.length === 0 ? <p className="px-3 py-2 text-sm text-neutral-500">Місто не знайдено</p> : null}
        </div>
      </div>
    </div>
  );
}
