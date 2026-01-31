"use client";

import Link from "next/link";

export function HeroThree() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-neutral-900 px-4 py-12 text-white shadow-lg sm:px-8 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-4 text-center text-3xl font-light tracking-tight leading-tight sm:text-5xl md:text-6xl">
          <p className="text-white/90">Ваша команда</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <span className="text-white/80">+</span>
            <span className="font-semibold text-white">Pitly</span>
            <span className="text-white/80">=</span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-2xl sm:text-3xl">
              📌<span className="text-white/80 text-xl sm:text-2xl">done</span>
            </span>
          </div>
          <p className="text-white/70 text-base sm:text-xl">Заявки закриваються швидше, партнери поруч.</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/request/repair"
            className="w-full max-w-xs rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:max-w-none sm:px-8"
          >
            Залишити заявку на ремонт
          </Link>
          <Link
            href="/request/parts"
            className="w-full max-w-xs rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:max-w-none sm:px-8"
          >
            Підібрати запчастини
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
    </section>
  );
}
