"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Inbox, ListChecks, LogOut, Settings, User } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Огляд", icon: Home },
  { href: "/dashboard/requests", label: "Inbox", icon: Inbox },
  { href: "/dashboard/offers", label: "Пропозиції", icon: ListChecks },
  { href: "/dashboard/orders", label: "Замовлення", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Профіль", icon: User },
  { href: "/dashboard/settings", label: "Налаштування", icon: Settings }
];
const bottomLinks = [
  { href: "/dashboard", label: "Огляд", icon: Home },
  { href: "/dashboard/requests", label: "Inbox", icon: Inbox },
  { href: "/dashboard/offers", label: "Пропозиції", icon: ListChecks },
  { href: "/dashboard/profile", label: "Профіль", icon: User }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-6xl flex-col gap-6 px-3 pb-24 pt-6 md:flex-row md:px-4 md:pb-6">
      <aside className="hidden w-64 shrink-0 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:block">
        <nav className="flex flex-col gap-2 text-sm font-semibold">
          {links.map((link) => {
            const Icon = link.icon;
            const isRoot = link.href === "/dashboard";
            const active = isRoot ? pathname === "/dashboard" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-neutral-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:ring-neutral-100/10",
                  active && "bg-neutral-900 text-white shadow-md hover:bg-neutral-900 dark:bg-white dark:text-neutral-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/logout"
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-neutral-600 transition hover:bg-rose-50 hover:text-rose-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-rose-300 dark:focus:ring-rose-300/30"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </Link>
        </nav>
      </aside>

      <section className="flex-1 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">{children}</section>

      {/* Bottom nav for mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-neutral-200 bg-white/95 px-3 py-3 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-900/90">
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const isRoot = link.href === "/dashboard";
          const active = isRoot ? pathname === "/dashboard" : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-semibold",
                active ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition",
                  active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
