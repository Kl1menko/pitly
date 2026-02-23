"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/shared/city-selector";
import { Input } from "@/components/ui/input";
import { type City } from "@/lib/types";

export function SearchHero({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [city, setCity] = useState<string>("");
  const [query, setQuery] = useState("");
  const [cityError, setCityError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCity = window.localStorage.getItem("pitly_home_search_city");
    const savedQuery = window.localStorage.getItem("pitly_home_search_query");
    if (savedCity && cities.some((c) => c.slug === savedCity)) {
      setCity(savedCity);
    }
    if (savedQuery) {
      setQuery(savedQuery);
    }
  }, [cities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) {
      setCityError("Оберіть місто, щоб запустити пошук");
      return;
    }
    setCityError(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pitly_home_search_city", city);
      window.localStorage.setItem("pitly_home_search_query", query.trim());
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/${city}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-white shadow-md shadow-neutral-200/50 px-2 sm:px-4">
      <div className="relative flex flex-col items-center gap-6 p-5 text-center sm:p-6 md:p-10">
        <div className="hero-pill-wrap relative inline-flex rounded-full p-[1.5px] shadow-sm">
          <div className="hero-pill-shine pointer-events-none absolute inset-0 rounded-full" />
          <div className="relative inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-1.5 text-[11px] font-semibold text-white sm:text-xs ring-1 ring-white/5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]" />
            </span>
            <span className="tracking-[0.08em] text-white">платформа Pitly</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="w-full text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
            Перевірені автосервіси — зручно знайти,{" "}
            <span className="inline-flex items-center gap-2 align-middle">
              <span>легко обрати</span>
              <video
                src="/videos/Check.webm"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                className="h-7 w-7 rounded-full object-contain sm:h-8 sm:w-8 md:h-9 md:w-9"
              />
            </span>
          </h1>
          <p className="max-w-3xl text-base text-neutral-700 sm:text-lg">
            Знайдіть сервіс за послугою або опишіть проблему — підкажемо напрямок і покажемо
            перевірені місця у вашому місті.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-5xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-neutral-200 sm:gap-4 sm:p-5 md:flex-row md:items-end"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-left text-sm font-semibold text-neutral-800">Що потрібно?</label>
            <Input
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("pitly_home_search_query", next);
                }
              }}
              placeholder="діагностика, полірування, шиномонтаж…"
              className="h-11"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-left text-sm font-semibold text-neutral-800">Місто</label>
            <CitySelector
              cities={cities}
              value={city}
              onChange={(nextCity) => {
                setCity(nextCity);
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("pitly_home_search_city", nextCity);
                }
                if (nextCity) setCityError(null);
              }}
            />
            {cityError ? <p className="mt-1 text-left text-xs font-medium text-rose-600">{cityError}</p> : null}
          </div>
          <Button
            size="lg"
            type="submit"
            disabled={!city}
            className="w-full shadow-lg shadow-neutral-300 transition hover:-translate-y-0.5 hover:shadow-neutral-400 md:w-40"
          >
            Знайти
          </Button>
        </form>
      </div>
      <style jsx>{`
        .hero-pill-wrap {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.65),
            rgba(132, 204, 22, 0.72),
            rgba(56, 189, 248, 0.5),
            rgba(255, 255, 255, 0.55)
          );
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.55),
            0 10px 22px rgba(15, 23, 42, 0.12);
        }

        .hero-pill-shine {
          overflow: hidden;
        }

        .hero-pill-shine::after {
          content: "";
          position: absolute;
          top: -30%;
          bottom: -30%;
          width: 34%;
          left: -42%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 35%,
            rgba(255, 255, 255, 0.42) 50%,
            rgba(255, 255, 255, 0.1) 65%,
            transparent 100%
          );
          transform: skewX(-22deg);
          animation: pitly-pill-shine 5.2s ease-in-out infinite;
        }

        @keyframes pitly-pill-shine {
          0%,
          75% {
            left: -42%;
            opacity: 0;
          }
          78% {
            opacity: 1;
          }
          92% {
            left: 108%;
            opacity: 1;
          }
          100% {
            left: 108%;
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-pill-shine::after {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
