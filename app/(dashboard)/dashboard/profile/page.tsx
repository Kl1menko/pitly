"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type RoleView = "client" | "partner";

export const dynamic = "force-dynamic";

export default function DashboardProfilePage() {
  return (
    <Suspense fallback={<div className="text-neutral-600">Завантаження профілю...</div>}>
      <DashboardProfileContent />
    </Suspense>
  );
}

function DashboardProfileContent() {
  const params = useSearchParams();
  const [role, setRole] = useState<RoleView>("client");

  useEffect(() => {
    const demo = params.get("demo");
    if (demo === "partner" || demo === "client") {
      setRole(demo);
      return;
    }
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("pitly_demo");
      if (stored === "partner" || stored === "client") setRole(stored);
    }
  }, [params]);

  const title = role === "partner" ? "Профіль партнера" : "Профіль клієнта";
  const subtitle =
    role === "partner"
      ? "Заповніть дані СТО або магазину, щоб з’явитися у каталозі та отримувати заявки."
      : "Доповніть свій профіль, щоб ми швидше підбирали сервіс і пропозиції.";

  const clientForm = (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Ім’я</Label>
          <Input placeholder="Ім’я та прізвище" />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input placeholder="+380..." />
        </div>
        <div>
          <Label>Місто</Label>
          <Input placeholder="Київ" />
        </div>
        <div>
          <Label>Telegram</Label>
          <Input placeholder="@username" />
        </div>
        <div className="md:col-span-2">
          <Label>Ваше авто / уподобання</Label>
          <Textarea placeholder="Марка, модель, що ремонтуєте найчастіше, бажаний час візиту" />
        </div>
      </div>
      <Button type="button">Зберегти (демо)</Button>
    </Card>
  );

  const partnerForm = (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Назва компанії</Label>
          <Input placeholder="STO Garage" />
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
        <div>
          <Label>Тип</Label>
          <Input placeholder="СТО або Магазин" />
        </div>
        <div>
          <Label>Графік роботи</Label>
          <Input placeholder="Пн-Пт 9:00-19:00" />
        </div>
        <div className="md:col-span-2">
          <Label>Опис</Label>
          <Textarea placeholder="Послуги, досвід, гарантії, спеціалізація" />
        </div>
      </div>
      <Button type="button">Зберегти (демо)</Button>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        <h1 className="text-2xl font-bold">Редагування профілю</h1>
        <p className="text-neutral-600">{subtitle}</p>
      </div>
      {role === "partner" ? partnerForm : clientForm}
    </div>
  );
}
