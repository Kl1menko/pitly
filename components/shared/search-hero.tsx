"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/shared/city-selector";
import { type City } from "@/lib/types";

export function SearchHero({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [city, setCity] = useState<string>("");
  const [mode, setMode] = useState<"sto" | "shops">("sto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    router.push(`/${city}/${mode}`);
  };

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col gap-6 overflow-hidden rounded-[28px] border border-neutral-100 bg-gradient-to-r from-[#f5f8ff] via-white to-[#e9f4ff] shadow-lg shadow-blue-100/40">
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85" />
      <div className="relative flex flex-col items-center gap-6 p-6 text-center md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
          платформа Pitly
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
            СТО та запчастини по всій Україні —{" "}
            <span className="typing-wrapper">
              <span className="typing-shadow">
                знайдіть потрібне за хвилину
              </span>
              <span className="typing-animated">
                знайдіть потрібне за хвилину
              </span>
            </span>
          </h1>
          <p className="max-w-3xl text-base text-neutral-700 md:text-lg">
            Обирай перевірені сервісні станції та магазини автозапчастин.
            Залишай заявку — ми передамо її партнерам.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-4xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100 backdrop-blur md:flex-row md:items-center"
        >
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <CitySelector cities={cities} value={city} onChange={setCity} />
            <div className="flex h-11 w-full overflow-hidden rounded-xl border border-blue-300 bg-blue-50 text-sm md:w-64">
              <button
                type="button"
                onClick={() => setMode("sto")}
                className={`flex-1 px-5 transition ${
                  mode === "sto"
                    ? "bg-white font-semibold text-neutral-900 shadow-md"
                    : "text-neutral-700"
                }`}
              >
                СТО
              </button>
              <button
                type="button"
                onClick={() => setMode("shops")}
                className={`flex-1 px-5 transition ${
                  mode === "shops"
                    ? "bg-white font-semibold text-neutral-900 shadow-md"
                    : "text-neutral-700"
                }`}
              >
                Запчастини
              </button>
            </div>
          </div>
          <Button
            size="lg"
            type="submit"
            className="md:w-40 shadow-lg shadow-blue-300 transition hover:-translate-y-0.5 hover:shadow-blue-400"
          >
            Знайти
          </Button>
        </form>
        <div className="grid w-full max-w-4xl gap-3 text-sm text-neutral-700 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 backdrop-blur">
            <p className="font-semibold text-neutral-900">1. Оберіть місто</p>
            <p className="text-neutral-600">
              Маємо всі обласні центри. Додамо більше на вимогу.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 backdrop-blur">
            <p className="font-semibold text-neutral-900">
              2. Фільтри по послугах
            </p>
            <p className="text-neutral-600">
              Ходова, діагностика, шини — шукайте потрібне одразу.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 backdrop-blur">
            <p className="font-semibold text-neutral-900">
              3. Залишайте заявку
            </p>
            <p className="text-neutral-600">
              Партнери отримують запит і дзвонять вам напряму.
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .typing-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: clamp(20ch, 24ch, 28ch);
          min-width: clamp(20ch, 24ch, 28ch);
          white-space: nowrap;
        }
        .typing-shadow {
          visibility: hidden;
        }
        .typing-animated {
          position: absolute;
          inset: 0;
          white-space: nowrap;
          overflow: hidden;
          animation: typing 4.5s linear infinite;
        }
        .typing-caret {
          display: inline-block;
          width: 3px;
          height: 1.2em;
          margin-left: 6px;
          background: #2563eb;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes typing {
          0%,
          10% {
            clip-path: inset(0 100% 0 0);
          }
          70% {
            clip-path: inset(0 0 0 0);
          }
          90%,
          100% {
            clip-path: inset(0 100% 0 0);
          }
        }
        @keyframes blink {
          from,
          to {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .typing-wrapper {
            width: clamp(18ch, 22ch, 24ch);
            min-width: clamp(18ch, 22ch, 24ch);
          }
        }
      `}</style>
    </section>
  );
}
