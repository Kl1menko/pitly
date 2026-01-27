import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Дякуємо! Заявку отримано",
  description: "Ми передали ваш запит партнерам. Очікуйте дзвінок."
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-primary">Успіх</p>
        <h1 className="mt-2 text-3xl font-bold">Дякуємо! Заявку отримано</h1>
        <p className="mt-3 text-neutral-600">Ми передали інформацію партнерам у вашому місті. Вони зв’яжуться найближчим часом.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/cities">Повернутись у каталог</Link>
          </Button>
          <Button asChild>
            <Link href="/request/repair">Подати ще заявку</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
