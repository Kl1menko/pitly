"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Огляд" },
  { href: "/dashboard/profile", label: "Профіль партнера" },
  { href: "/dashboard/requests", label: "Мої заявки" },
  { href: "/dashboard/admin", label: "Адмін-модерація" },
  { href: "/dashboard/settings", label: "Налаштування" }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
      <aside className="w-full rounded-2xl border border-neutral-200 bg-white p-4 md:w-64">
        <nav className="flex flex-col gap-2 text-sm font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-2 text-neutral-700 hover:bg-neutral-100",
                pathname === link.href && "bg-neutral-100 text-neutral-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="flex-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</section>
    </div>
  );
}
