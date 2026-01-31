"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

export function Header() {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeIcon = useMemo(() => {
    if (!mounted) return null;
    return resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  }, [mounted, resolvedTheme]);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            <Image src="/images/pitly.svg" alt="Pitly" width={36} height={36} className="h-9 w-9" priority />
            <span>Pitly</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-neutral-800 dark:text-neutral-200 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname?.startsWith(item.href)
                    ? "text-neutral-900 underline decoration-neutral-900/50 underline-offset-4 dark:text-white dark:decoration-neutral-200/70"
                    : "hover:text-neutral-950 dark:hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
            >
              {mounted && (resolvedTheme === "dark" ? "Світла" : "Темна")}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-white">
                {themeIcon}
              </span>
            </button>
            {userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white sm:px-4"
                >
                  Кабінет
                </Link>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-300 dark:bg-neutral-800 dark:ring-neutral-700">
                  <Image src="/images/icons/car_icon.webp" alt="User avatar" width={40} height={40} className="h-full w-full object-cover" />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white sm:px-4"
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-300 shadow-sm transition hover:-translate-y-0.5 dark:bg-neutral-900 dark:text-neutral-50 dark:ring-neutral-700 sm:px-4"
                >
                  Стати партнером
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label="Відкрити меню"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto inline-flex items-center justify-center rounded-full border border-neutral-300 p-2 text-neutral-900 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-800 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {/* Mobile menu modal */}
      <div
        className={`fixed inset-0 z-[12000] md:hidden transition-opacity duration-200 ${
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
            className={`w-[92vw] max-w-md h-[calc(88vh-20px)] max-h-[calc(88vh-20px)] overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-neutral-900 ${
              open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50" onClick={close}>
                <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" />
                Pitly
              </Link>
              <button
                aria-label="Закрити меню"
                onClick={close}
                className="rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex h-[calc(88vh-64px)] flex-col px-5 pb-6 pt-4 overflow-y-auto">
              <nav className="flex flex-1 flex-col gap-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`rounded-xl px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                      pathname?.startsWith(item.href) ? "bg-neutral-900/5 text-neutral-900 dark:bg-neutral-800 dark:text-white" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-6 pb-1">
                {userEmail ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="w-full rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                      Кабінет
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                        <Image src="/images/icons/car_icon.webp" alt="User avatar" width={40} height={40} className="h-full w-full object-cover" />
                      </span>
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={close}
                      className="w-full rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                    >
                      Увійти
                    </Link>
                    <Link
                      href="/register"
                      onClick={close}
                      className="w-full rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Стати партнером
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
                >
                  {mounted && (resolvedTheme === "dark" ? "Світла тема" : "Темна тема")}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-white">
                    {themeIcon}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
