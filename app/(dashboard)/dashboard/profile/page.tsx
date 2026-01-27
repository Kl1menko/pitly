import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function DashboardProfilePage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Профіль партнера</p>
        <h1 className="text-2xl font-bold">Редагування профілю</h1>
        <p className="text-neutral-600">Заповніть інформацію про СТО або магазин. Потрібна авторизація у Supabase.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Назва</Label>
          <Input placeholder="Назва компанії" />
        </div>
        <div>
          <Label>Місто</Label>
          <Input placeholder="Київ" />
        </div>
        <div className="md:col-span-2">
          <Label>Адреса</Label>
          <Input placeholder="вул. Прикладна, 10" />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input placeholder="+380..." />
        </div>
        <div>
          <Label>Telegram</Label>
          <Input placeholder="@username" />
        </div>
        <div className="md:col-span-2">
          <Label>Опис</Label>
          <Textarea placeholder="Коротко про послуги, досвід, гарантії" />
        </div>
        <div className="md:col-span-2">
          <Button type="button">Зберегти (mock)</Button>
        </div>
      </form>
    </div>
  );
}
