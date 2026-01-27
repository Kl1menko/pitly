import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Налаштування</p>
        <h1 className="text-2xl font-bold">Сповіщення та доступ</h1>
        <p className="text-neutral-600">У продакшн: вмикаємо webhooks/email через Supabase.</p>
      </div>
      <Card className="space-y-3">
        <Label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Email про нові заявки
        </Label>
        <Label className="flex items-center gap-2">
          <Checkbox /> SMS дублювання
        </Label>
        <Button className="mt-2" type="button">
          Зберегти
        </Button>
      </Card>
    </div>
  );
}
