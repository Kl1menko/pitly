import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md">
              P
            </span>
            <span className="hidden sm:block">Pitly</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-neutral-800 md:flex">
            <Link href="/cities">Міста</Link>
            <Link href="/how-it-works">Як працює</Link>
            <Link href="/request/repair">Заявка на ремонт</Link>
            <Link href="/request/parts">Запчастини</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 sm:px-4"
            >
              Кабінет
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-neutral-900 shadow-md sm:px-4"
            >
              Додати СТО
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
