 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Image src="/images/pitly.svg" alt="Pitly" width={36} height={36} className="h-9 w-9" priority />
            <span className="hidden sm:block">Pitly</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-neutral-800 md:flex">
            <Link href="/cities">Міста</Link>
            <Link href="/how-it-works">Як це працює</Link>
            <Link href="/request/repair">Заявка на ремонт</Link>
            <Link href="/request/parts">Заявка на запчастини</Link>
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 sm:px-4"
            >
              Увійти
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-300 shadow-sm transition hover:-translate-y-0.5 sm:px-4"
            >
              Стати партнером
            </Link>
          </div>
          <button
            aria-label="Відкрити меню"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto inline-flex items-center justify-center rounded-full border border-neutral-300 p-2 text-neutral-900 shadow-sm transition hover:bg-neutral-100 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between px-5 py-4 shadow-sm">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900" onClick={close}>
              <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" />
              Pitly
            </Link>
            <button
              aria-label="Закрити меню"
              onClick={close}
              className="rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-[calc(100vh-64px)] flex-col overflow-y-auto px-5 pb-8 pt-4">
            <nav className="flex flex-col gap-2 text-base font-semibold text-neutral-900">
              <Link href="/cities" onClick={close} className="rounded-xl px-3 py-3 hover:bg-neutral-50">
                Міста
              </Link>
              <Link href="/how-it-works" onClick={close} className="rounded-xl px-3 py-3 hover:bg-neutral-50">
                Як це працює
              </Link>
              <Link href="/request/repair" onClick={close} className="rounded-xl px-3 py-3 hover:bg-neutral-50">
                Заявка на ремонт
              </Link>
              <Link href="/request/parts" onClick={close} className="rounded-xl px-3 py-3 hover:bg-neutral-50">
                Заявка на запчастини
              </Link>
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <Link
                href="/login"
                onClick={close}
                className="w-full rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800"
              >
                Увійти
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="w-full rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Стати партнером
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
