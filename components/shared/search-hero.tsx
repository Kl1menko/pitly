"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/shared/city-selector";
import { type City } from "@/lib/types";

export function SearchHero({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [city, setCity] = useState<string>("");
  const [mode, setMode] = useState<"sto" | "shops">("sto");
  const phrases = [
    "усе просто — у кілька кліків",
    "знайдіть і замовте за хвилину",
    "усе для авто — швидко й зручно",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    router.push(`/${city}/${mode}`);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3200);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-white shadow-md shadow-neutral-200/50 px-2 dark:border-neutral-800 dark:bg-gradient-to-r dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 dark:shadow-[0_25px_80px_-45px_rgba(0,0,0,0.8)] sm:px-4">
      <div className="relative flex flex-col items-center gap-6 p-5 text-center sm:p-6 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm ring-1 ring-neutral-900/30 dark:bg-white dark:text-neutral-900 dark:ring-white/40 sm:text-xs">
          платформа Pitly
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="w-full text-2xl font-bold leading-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl">
            СТО та запчастини по всій Україні —{" "}
            <span
              key={phraseIndex}
              className="flip-text block min-h-[2.6rem] text-center sm:min-h-[2.8rem] md:min-h-[3.2rem]"
            >
              {phrases[phraseIndex]}
            </span>
          </h1>
          <p className="max-w-3xl text-base text-neutral-700 dark:text-neutral-300 sm:text-lg">
            Обирай перевірені сервісні станції та магазини автозапчастин.
            Залишай заявку — ми передамо її партнерам.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-neutral-200 sm:gap-4 sm:p-5 md:flex-row md:items-center dark:bg-neutral-900 dark:ring-neutral-800 dark:shadow-[0_25px_70px_-40px_rgba(0,0,0,0.8)]"
        >
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <CitySelector cities={cities} value={city} onChange={setCity} />
            <div className="flex h-11 w-full overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50 text-sm md:w-64 dark:border-neutral-700 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setMode("sto")}
                className={`flex-1 px-5 transition ${mode === "sto" ? "bg-white font-semibold text-neutral-900 shadow-md dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                СТО
              </button>
              <button
                type="button"
                onClick={() => setMode("shops")}
                className={`flex-1 px-5 transition ${mode === "shops" ? "bg-white font-semibold text-neutral-900 shadow-md dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                Запчастини
              </button>
            </div>
          </div>
          <Button
            size="lg"
            type="submit"
            className="w-full shadow-lg shadow-neutral-300 transition hover:-translate-y-0.5 hover:shadow-neutral-400 md:w-40 dark:shadow-[0_25px_60px_-30px_rgba(0,0,0,0.7)]"
          >
            Знайти
          </Button>
        </form>

      </div>
      <style jsx>{`
        .flip-text {
          display: block;
          white-space: normal;
          word-break: break-word;
          animation: flip 0.9s ease;
          transform-origin: center;
        }
        @keyframes flip {
          0% {
            opacity: 0;
            transform: rotateX(-90deg);
          }
          50% {
            opacity: 1;
            transform: rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg);
          }
        }
        @media (max-width: 768px) {
          h1 {
            font-size: 1.65rem;
            line-height: 2.1rem;
          }
        }
      `}</style>
    </section>
  );
}
