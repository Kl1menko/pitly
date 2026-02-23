"use client";

import { useEffect, useState } from "react";
import { Crosshair, MapPin, X } from "lucide-react";
import { sileo } from "sileo";

import { getPreferredCitySlug, setPreferredCitySlug } from "@/lib/city/preference";
import { type City } from "@/lib/types";

const STORAGE_KEY = "pitly_geo_permission_nudge_seen_v1";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const ALWAYS_SHOW_FOR_TEST = false;

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

function findNearestCity(cities: City[], lat: number, lng: number) {
  return cities
    .filter((city) => typeof city.lat === "number" && typeof city.lng === "number")
    .map((city) => ({
      city,
      distance: distanceKm(lat, lng, city.lat as number, city.lng as number)
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.city ?? null;
}

export function GeoPermissionNudge({ cities }: { cities: City[] }) {
  const [visible, setVisible] = useState(false);

  const markSeen = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const closeNudge = () => {
    markSeen();
    setVisible(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (getPreferredCitySlug()) return;

    if (!ALWAYS_SHOW_FOR_TEST) {
      const seenAtRaw = window.localStorage.getItem(STORAGE_KEY);
      if (seenAtRaw) {
        const seenAt = Number(seenAtRaw);
        if (Number.isFinite(seenAt) && Date.now() - seenAt < COOLDOWN_MS) return;
      }
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [cities]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[min(92vw,360px)]">
      <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-5 pb-5 pt-4 text-white shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          aria-label="Закрити підказку"
          onClick={closeNudge}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/10">
            <MapPin className="h-4 w-4" />
            <span>Дозволити геолокацію?</span>
          </div>
          <p className="text-sm leading-relaxed text-white/95">
            Підставимо ваше місто автоматично, щоб швидше показати сервіси поруч.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const nearestCity = findNearestCity(cities, position.coords.latitude, position.coords.longitude);
                  if (!nearestCity) {
                    sileo.warning({
                      title: "Не вдалося визначити місто",
                      description: "Оберіть місто вручну у пошуку або каталозі."
                    });
                    return;
                  }
                  setPreferredCitySlug(nearestCity.slug);
                  markSeen();
                  setVisible(false);
                  sileo.success({
                    title: `Місто визначено: ${nearestCity.name_ua}`,
                    description: "Будемо підставляти його у пошуку та підборі сервісів."
                  });
                },
                () => {
                  markSeen();
                  setVisible(false);
                  sileo.warning({
                    title: "Геолокацію не дозволено",
                    description: "Можна продовжити без неї — просто оберіть місто вручну."
                  });
                },
                { enableHighAccuracy: false, timeout: 6000 }
              );
            }}
            className="inline-flex min-w-[168px] items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            <Crosshair className="h-4 w-4" />
            Дозволити
          </button>
        </div>
      </div>
    </div>
  );
}
