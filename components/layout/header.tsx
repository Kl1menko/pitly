import Link from "next/link";
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#d9e8ff] via-[#e7f2ff] to-[#d9e8ff] py-3">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-[0_10px_30px_-12px_rgba(37,99,235,0.35)] ring-1 ring-blue-50 md:gap-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              P
            </span>
            <span className="hidden sm:block">Pitly</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-neutral-700 md:flex">
            <Link href="/cities">Міста</Link>
            <Link href="/how-it-works">Як працює</Link>
            <Link href="/request/repair">Заявка на ремонт</Link>
            <Link href="/request/parts">Запчастини</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 sm:px-4"
            >
              Кабінет
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 sm:px-4"
            >
              Додати СТО
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
