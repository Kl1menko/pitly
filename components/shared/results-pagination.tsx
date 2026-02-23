import Link from "next/link";

type Props = {
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  totalPages: number;
};

function buildHref(pathname: string, searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
      continue;
    }
    if (!value) continue;
    if (key === "page") continue;
    params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ResultsPagination({ pathname, searchParams, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={buildHref(pathname, searchParams, Math.max(1, page - 1))}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
          page <= 1 ? "pointer-events-none border-neutral-200 text-neutral-400" : "border-neutral-300 text-neutral-800 hover:bg-neutral-50"
        }`}
      >
        Назад
      </Link>

      {start > 1 && (
        <>
          <Link href={buildHref(pathname, searchParams, 1)} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
            1
          </Link>
          {start > 2 ? <span className="px-1 text-sm text-neutral-500">…</span> : null}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(pathname, searchParams, p)}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
            p === page ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-800 hover:bg-neutral-50"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 ? <span className="px-1 text-sm text-neutral-500">…</span> : null}
          <Link href={buildHref(pathname, searchParams, totalPages)} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(pathname, searchParams, Math.min(totalPages, page + 1))}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
          page >= totalPages ? "pointer-events-none border-neutral-200 text-neutral-400" : "border-neutral-300 text-neutral-800 hover:bg-neutral-50"
        }`}
      >
        Далі
      </Link>
    </div>
  );
}
