 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  const navLinks = [
    { href: "/cities", label: "Міста" },
    { href: "/how-it-works", label: "Як це працює" },
    { href: "/request/repair", label: "Заявка на ремонт" },
    { href: "/request/parts", label: "Заявка на запчастини" }
  ];

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <Image src="/images/pitly.svg" alt="Pitly" width={36} height={36} className="h-9 w-9" priority />
            <span>Pitly</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-neutral-800 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname?.startsWith(item.href) ? "text-neutral-900 underline decoration-neutral-900/50 underline-offset-4" : ""}
              >
                {item.label}
              </Link>
            ))}
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
      {/* Mobile menu modal */}
      <div
        className={`fixed inset-0 z-[9999] md:hidden transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобільне меню"
      >
        <div
          className={`absolute inset-0 bg-neutral-900/65 backdrop-blur-[2px] transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={close}
        />

        <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-10">
          <div
            className={`w-[92vw] max-w-md h-[88vh] max-h-[88vh] overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${
              open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
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

            <div className="flex h-[calc(88vh-64px)] flex-col px-5 pb-6 pt-4 overflow-y-auto">
              <nav className="flex flex-1 flex-col gap-2 text-base font-semibold text-neutral-900">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`rounded-xl px-3 py-3 hover:bg-neutral-50 ${
                      pathname?.startsWith(item.href) ? "bg-neutral-900/5 text-neutral-900" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-6 pb-1">
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
        </div>
      </div>
    </header>
  );
}
