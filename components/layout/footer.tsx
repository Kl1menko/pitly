import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();
  const navPrimary = [
    { href: "/how-it-works", label: "Як працює" },
    { href: "/cities", label: "Міста" },
    { href: "/request/repair", label: "Заявка на ремонт" },
    { href: "/request/parts", label: "Заявка на запчастини" }
  ];

  const navInfo = [
    { href: "/privacy", label: "Політика конфіденційності" },
    { href: "/terms", label: "Умови користування" },
    { href: "/support", label: "Підтримка" }
  ];

  return (
    <>
      <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:justify-between">
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 ring-1 ring-white/10">
                <Image src="/images/pitly.svg" alt="Pitly" width={32} height={32} className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Pitly</p>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Сервіси та запчастини</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-neutral-300">
              Pitly об’єднує СТО та магазини запчастин по Україні. Подайте заявку — отримаєте пропозиції без зайвих дзвінків і збережете історію звернень.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Навігація</p>
              <div className="mt-3 space-y-2">
                {navPrimary.map((item) => (
                  <Link key={item.href} href={item.href} className="block text-neutral-200 transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Інфо</p>
              <div className="mt-3 space-y-2">
                {navInfo.map((item) => (
                  <Link key={item.href} href={item.href} className="block text-neutral-200 transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
                <span className="block text-neutral-400">support@pitly.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {year} Pitly. Усі права захищені.</span>
            <div className="flex flex-wrap gap-2">
              <Link href="/privacy" className="hover:text-white">
                Політика конфіденційності
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white">
                Умови
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
