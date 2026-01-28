# Pitly (Next.js + Supabase)

Публічний каталог СТО та магазинів запчастин із заявками, базовим SEO та кабінетом. Стек: Next.js 14 (App Router), TypeScript, Tailwind + shadcn-style UI, Supabase JS, React Query, Zod, React Hook Form, Leaflet.

## Запуск локально

1. Скопіюйте `.env.example` у `.env.local` та підставте значення Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SITE_URL` (наприклад, `http://localhost:3000`)
2. Встановіть залежності:
   ```bash
   npm install
   ```
3. Запустіть dev-сервер:
   ```bash
   npm run dev
   ```
4. Перейдіть на `http://localhost:3000`.

## Деплой на Vercel

1. Створіть новий проект у Vercel та підключіть репозиторій.
2. У розділі Environment Variables додайте ті ж змінні, що і в `.env.local`.
3. Білд-команда: `npm run build`, старт: `npm start`.
4. Після деплою запустіть `npm run sitemap` локально або підключіть GitHub Action, щоб згенерувати `sitemap.xml`/`robots.txt` (next-sitemap).

## Підключення Supabase

1. Створіть проект у Supabase, застосуйте SQL із `schema.sql` (створює таблиці, RLS, seed довідників).
2. У Storage додайте bucket `request-photos` (public) для завантаження фото в заявках.
3. У налаштуваннях Auth ввімкніть OTP по телефону (якщо потрібно), налаштуйте шаблони SMS.
4. Вставте URL/anon key у `.env.local`.

## Структура

- `app/` — публічні сторінки, заявки, дашборд, auth, sitemap API.
- `components/` — UI (shadcn-style), карти, форми, фільтри, лейаути.
- `lib/supabase` — клієнт/сервер Supabase, запити + demo fallback.
- `lib/data/demo.ts` — демо-дані (міста, послуги, бренди, партнери) для швидкого перегляду.
- `lib/validators` — Zod-схеми форм.

## Демо-партнери (UI-прев’ю)

- СТО: **DriveTech СТО** (Київ, slug `drivetech`, послуги: ходова, діагностика, заміна масла)
- СТО: **Lviv Auto Service** (Львів, slug `lviv-auto`)
- Магазин: **PartLab Магазин** (Київ, slug `partlab`, категорії: двигун, гальмівна, доставка)

## Корисні скрипти

- `npm run dev` — дев-сервер
- `npm run build` — продакшн білд
- `npm run start` — старт продакшн
- `npm run lint` — ESLint
- `npm run sitemap` — генерація sitemap/robots через next-sitemap

## TODO / наступні кроки

- Підтягнути реальні моделі авто та мапити ID на назви у карточках.
- Додати справжній захист дашборду через Supabase Auth helpers (middleware + server components).
- Зробити збереження профілю партнера (форму прив’язати до таблиць partners/partner_services/partner_car_compatibility).
- Підтягнути карти/координати з бази, додати селектор на формі профілю. 
