import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Кабінет</p>
        <h1 className="text-2xl font-bold">Швидкий огляд</h1>
        <p className="text-neutral-600">Заповніть профіль партнера та отримуйте заявки.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-neutral-600">Статус профілю</p>
          <p className="text-xl font-semibold">Не заповнено</p>
          <Button asChild className="mt-3">
            <Link href="/dashboard/profile">Заповнити</Link>
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600">Заявок цього місяця</p>
          <p className="text-xl font-semibold">—</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600">Рекомендація</p>
          <p className="text-sm text-neutral-700">Додайте послуги та категорії, щоб потрапляти у фільтри.</p>
        </Card>
      </div>
    </div>
  );
}
