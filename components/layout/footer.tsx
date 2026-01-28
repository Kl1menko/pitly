import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} Pitly. Знайди сервіс поруч.</div>
        <div className="flex gap-4">
          <Link href="/how-it-works">Як працює</Link>
          <Link href="/cities">Міста</Link>
          <Link href="/request/repair">Заявка</Link>
        </div>
      </div>
    </footer>
  );
}
