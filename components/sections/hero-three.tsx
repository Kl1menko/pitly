"use client";

import Image from "next/image";

export function HeroThree() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-neutral-900 px-4 py-14 text-white shadow-lg sm:px-8 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center font-light leading-tight sm:gap-8 sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 text-4xl sm:justify-start sm:gap-4 sm:text-5xl md:text-6xl">
          <span className="text-white/90">Pitly keeps you</span>
          <Image
            src="/images/icons/car_por_bg.png"
            alt="Авто"
            width={260}
            height={120}
            className="h-14 w-auto sm:h-18 md:h-20"
            priority
          />
          <span className="text-white/90">ahead.</span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
    </section>
  );
}
