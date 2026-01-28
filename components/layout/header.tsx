import Link from "next/link";
import Image from "next/image";

export function Header() {
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
          <div className="ml-auto flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
