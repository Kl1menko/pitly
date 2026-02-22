"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { sileo } from "sileo";

import { getPreferredCitySlug, setPreferredCitySlug } from "@/lib/city/preference";
import { type City } from "@/lib/types";

const STORAGE_KEY = "pitly_geo_permission_nudge_seen_v1";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

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
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (getPreferredCitySlug()) return;

    const seenAtRaw = window.localStorage.getItem(STORAGE_KEY);
    if (seenAtRaw) {
      const seenAt = Number(seenAtRaw);
      if (Number.isFinite(seenAt) && Date.now() - seenAt < COOLDOWN_MS) return;
    }

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      sileo.info({
        title: "Дозволити геолокацію?",
        description: "Підставимо ваше місто автоматично, щоб швидше показати сервіси поруч.",
        icon: <MapPin className="h-4 w-4" />,
        button: {
          title: "Дозволити",
          onClick: () => {
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
                sileo.success({
                  title: `Місто визначено: ${nearestCity.name_ua}`,
                  description: "Будемо підставляти його у пошуку та підборі сервісів."
                });
              },
              () => {
                sileo.warning({
                  title: "Геолокацію не дозволено",
                  description: "Можна продовжити без неї — просто оберіть місто вручну."
                });
              },
              { enableHighAccuracy: false, timeout: 6000 }
            );
          }
        }
      });
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [cities]);

  return null;
}
