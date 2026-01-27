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
  const phrases = ["сервіс у кілька кліків", "знайдіть і замовте за хвилину", "усе для авто — швидко й зручно"];
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
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[28px] border border-neutral-100 bg-gradient-to-r from-[#f5f8ff] via-white to-[#e9f4ff] shadow-md shadow-blue-100/30 px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85" />
      <div className="relative flex flex-col items-center gap-6 p-5 text-center sm:p-6 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 sm:text-xs">
          платформа Pitly
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="w-full text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
            СТО та запчастини по всій Україні —{" "}
            <span key={phraseIndex} className="flip-text">
              {phrases[phraseIndex]}
            </span>
          </h1>
          <p className="max-w-3xl text-base text-neutral-700 sm:text-lg">
            Обирай перевірені сервісні станції та магазини автозапчастин. Залишай заявку — ми передамо її партнерам.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-100 sm:gap-4 sm:p-5 md:flex-row md:items-center"
        >
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <CitySelector cities={cities} value={city} onChange={setCity} />
            <div className="flex h-11 w-full overflow-hidden rounded-xl border border-blue-300 bg-blue-50 text-sm md:w-64">
              <button
                type="button"
                onClick={() => setMode("sto")}
                className={`flex-1 px-5 transition ${mode === "sto" ? "bg-white font-semibold text-neutral-900 shadow-md" : "text-neutral-700"}`}
              >
                СТО
              </button>
              <button
                type="button"
                onClick={() => setMode("shops")}
                className={`flex-1 px-5 transition ${mode === "shops" ? "bg-white font-semibold text-neutral-900 shadow-md" : "text-neutral-700"}`}
              >
                Запчастини
              </button>
            </div>
          </div>
          <Button
            size="lg"
            type="submit"
            className="w-full shadow-lg shadow-blue-300 transition hover:-translate-y-0.5 hover:shadow-blue-400 md:w-40"
          >
            Знайти
          </Button>
        </form>
        <div className="grid w-full max-w-5xl gap-3 text-sm text-neutral-700 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <p className="font-semibold text-neutral-900">1. Оберіть місто</p>
            <p className="text-neutral-600">Маємо всі обласні центри. Додамо більше на вимогу.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <p className="font-semibold text-neutral-900">2. Фільтри по послугах</p>
            <p className="text-neutral-600">Ходова, діагностика, шини — шукайте потрібне одразу.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <p className="font-semibold text-neutral-900">3. Залишайте заявку</p>
            <p className="text-neutral-600">Партнери отримують запит і дзвонять вам напряму.</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .typing-text {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          width: var(--typing-length, 28ch);
          min-width: var(--typing-length, 28ch);
          animation: typing 5s ease-in-out infinite alternate;
        }
        @keyframes typing {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
        @media (max-width: 768px) {
          :root {
            --typing-length: 22ch;
          }
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <style jsx>{`
        .flip-text {
          display: inline-block;
          white-space: normal;
          word-break: break-word;
          text-align: center;
          animation: flip 0.9s ease;
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
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
