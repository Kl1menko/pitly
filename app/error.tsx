"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Щось пішло не так</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{error.message}</p>
          <button
            onClick={reset}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Спробувати ще раз
          </button>
        </div>
      </body>
    </html>
  );
}
