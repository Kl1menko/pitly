"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "З Pitly ми почали отримувати стабільні заявки без додаткової реклами.",
    author: "AutoService Львів",
    role: "СТО · Львів",
  },
  {
    quote: "Зручно для клієнтів і легко в управлінні.",
    author: "Garage Pro Київ",
    role: "СТО · Київ",
  },
  {
    quote: "Ліди приходять напряму, не витрачаємо час на холодні дзвінки.",
    author: "PartsLab Харків",
    role: "Магазин запчастин · Харків",
  },
];

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-5 text-white shadow-xl ring-1 ring-black/10 sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl sm:h-44 sm:w-44" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
        Відгуки партнерів
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-[1.5fr_auto] sm:items-center">
        <div className="relative min-h-[200px] sm:min-h-[170px]">
          {testimonials.map((item, i) => {
            const isActive = i === index;
            return (
              <Card
                key={item.author}
                className={cn(
                  "absolute inset-0 flex flex-col gap-3 bg-white/95 p-5 shadow-2xl ring-1 ring-neutral-200/70 backdrop-blur transition-all duration-500 sm:p-6",
                  isActive
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                )}
                aria-hidden={!isActive}
              >
                <span className="text-2xl leading-none text-neutral-300">“</span>
                <p className="text-base font-medium text-neutral-900 sm:text-lg">{item.quote}</p>
                <div className="text-sm font-semibold text-neutral-800">{item.author}</div>
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  {item.role}
                </div>
              </Card>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-6 rounded-full transition sm:h-2.5 sm:w-7",
                  i === index
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60 sm:text-xs">
            {index + 1} / {testimonials.length}
          </div>
        </div>
      </div>
    </div>
  );
}
