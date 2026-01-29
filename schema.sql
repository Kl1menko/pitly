-- schema.sql — Supabase/PostgreSQL для CTO-платформи
-- Усі таблиці у схемі public. Використовується UUID PK, базові довідники із seed-даними.
-- updated_at оновлюється тригером set_updated_at().

set check_function_bodies = off;
set search_path = public;

-- Розширення
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Тригер для автоматичного оновлення updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Таблиці

-- 2.2 Cities (першою, бо потрібна в інших FK)
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  name_en text,
  slug text not null unique,
  region_ua text,
  lat float8,
  lng float8,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists cities_slug_idx on public.cities(slug);
create index if not exists cities_name_ua_idx on public.cities(name_ua);

-- 2.1 Profiles
create table if not exists public.profiles (
  id uuid primary key,
  role text not null check (role in ('client','partner_sto','partner_shop','admin')),
  full_name text,
  phone text,
  city_id uuid references public.cities(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles(role);

-- 2.3 Partners
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id),
  type text not null check (type in ('sto','shop')),
  name text not null,
  slug text not null unique,
  city_id uuid not null references public.cities(id),
  address text,
  lat float8,
  lng float8,
  phone text,
  telegram text,
  website text,
  description text,
  work_hours jsonb,
  price_level int2,
  verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending','active','blocked')),
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists partners_type_city_idx on public.partners(type, city_id);
create index if not exists partners_status_idx on public.partners(status);
create index if not exists partners_verified_idx on public.partners(verified);
create index if not exists partners_rating_avg_idx on public.partners(rating_avg);

-- 2.4 Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  category text,
  is_active boolean not null default true
);

-- 2.5 Partner services (many-to-many)
create table if not exists public.partner_services (
  partner_id uuid not null references public.partners(id) on delete cascade,
  service_id uuid not null references public.services(id),
  price_from numeric,
  primary key (partner_id, service_id),
  constraint partner_services_partner_is_sto check (
    exists (select 1 from public.partners p where p.id = partner_id and p.type = 'sto')
  )
);

create index if not exists partner_services_service_id_idx on public.partner_services(service_id);

-- 2.6 Car brands/models
create table if not exists public.car_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.car_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.car_brands(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (brand_id, slug)
);

-- 2.7 Partner car compatibility
create table if not exists public.partner_car_compatibility (
  partner_id uuid not null references public.partners(id) on delete cascade,
  brand_id uuid not null references public.car_brands(id),
  model_id uuid references public.car_models(id),
  primary key (partner_id, brand_id, model_id)
);

create index if not exists partner_car_compatibility_brand_idx on public.partner_car_compatibility(brand_id);
create index if not exists partner_car_compatibility_model_idx on public.partner_car_compatibility(model_id);

-- 2.8 Part categories
create table if not exists public.part_categories (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  is_active boolean not null default true
);

-- 2.9 Shop part offers
create table if not exists public.shop_part_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  category_id uuid not null references public.part_categories(id),
  brand_id uuid references public.car_brands(id),
  note text,
  delivery_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint shop_part_offers_partner_is_shop check (
    exists (select 1 from public.partners p where p.id = partner_id and p.type = 'shop')
  )
);

create index if not exists shop_part_offers_partner_category_idx on public.shop_part_offers(partner_id, category_id);
create index if not exists shop_part_offers_brand_idx on public.shop_part_offers(brand_id);

-- 3.1 Requests
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.profiles(id),
  type text not null check (type in ('repair','parts')),
  city_id uuid not null references public.cities(id),
  car_brand_id uuid references public.car_brands(id),
  car_model_id uuid references public.car_models(id),
  car_model_name text,
  car_year int2,
  vin text,
  part_category_id uuid references public.part_categories(id),
  extra_part_categories text[] default '{}'::text[],
  part_query text,
  service_id uuid references public.services(id),
  extra_services text[] default '{}'::text[],
  problem_description text,
  photos jsonb not null default '[]'::jsonb,
  contact_phone text not null,
  contact_name text,
  preferred_time text,
  status text not null default 'draft' check (
    status in (
      'draft',
      'published',
      'offers_collecting',
      'client_selected_offer',
      'in_progress',
      'done',
      'cancelled',
      'expired'
    )
  ),
  target_partner_id uuid references public.partners(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists requests_type_city_status_idx on public.requests(type, city_id, status);
create index if not exists requests_client_profile_idx on public.requests(client_profile_id);
create index if not exists requests_target_partner_idx on public.requests(target_partner_id);

-- 3.2 Offers (пропозиції від партнерів)
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  partner_id uuid not null references public.partners(id),
  price numeric,
  eta_days int2,
  note text,
  status text not null default 'sent' check (status in ('sent','viewed','accepted','rejected','expired')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists offers_request_idx on public.offers(request_id);
create index if not exists offers_partner_status_idx on public.offers(partner_id, status);

-- 3.3 Orders (угоди після вибору оффера)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  offer_id uuid not null references public.offers(id),
  client_id uuid not null references public.profiles(id),
  partner_id uuid not null references public.partners(id),
  status text not null default 'created' check (
    status in ('created','confirmed','in_progress','fulfilled','closed','cancelled','refund_requested','refunded')
  ),
  scheduled_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_request_idx on public.orders(request_id);
create index if not exists orders_partner_status_idx on public.orders(partner_id, status);
create index if not exists orders_client_idx on public.orders(client_id);

-- 3.4 Messages (чат у рамках заявки)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- 3.5 Public request links (magic links для гостей)
create table if not exists public.request_links (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  token text not null unique,
  channel text not null check (channel in ('telegram')),
  contact text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists request_links_request_idx on public.request_links(request_id);
create index if not exists request_links_expires_idx on public.request_links(expires_at);

create index if not exists messages_request_idx on public.messages(request_id);
create index if not exists messages_sender_idx on public.messages(sender_id);

-- 3.5 Complaints/Скарги
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id),
  target_partner_id uuid references public.partners(id),
  request_id uuid references public.requests(id),
  order_id uuid references public.orders(id),
  complaint_type text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in_review','resolved','rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_actor_idx on public.complaints(actor_profile_id);

-- 4 Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  client_profile_id uuid not null references public.profiles(id),
  rating int2 not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists reviews_partner_idx on public.reviews(partner_id);
create index if not exists reviews_status_idx on public.reviews(status);

-- Функція: коли оффер прийнято — відхиляємо інші, ставимо заявку в client_selected_offer, створюємо order
create or replace function public.on_offer_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'accepted' then
    update public.offers
      set status = 'rejected',
          updated_at = timezone('utc', now())
      where request_id = new.request_id
        and id <> new.id
        and status in ('sent','viewed');

    update public.requests
      set status = 'client_selected_offer',
          updated_at = timezone('utc', now())
      where id = new.request_id
        and status in ('published','offers_collecting','in_progress','draft');

    insert into public.orders (request_id, offer_id, client_id, partner_id)
    select r.id, new.id, r.client_profile_id, new.partner_id
    from public.requests r
    where r.id = new.request_id
    on conflict do nothing;
  end if;
  return new;
end;
$$;

-- Функція: коли статус order стає fulfilled/closed → заявка done; cancelled → cancelled
create or replace function public.on_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('fulfilled','closed') then
    update public.requests
      set status = 'done',
          updated_at = timezone('utc', now())
      where id = new.request_id;
  elsif new.status = 'cancelled' then
    update public.requests
      set status = 'cancelled',
          updated_at = timezone('utc', now())
      where id = new.request_id;
  end if;
  return new;
end;
$$;

-- updated_at тригери
do $$
begin
  perform 1 from pg_trigger where tgname = 'set_updated_at_profiles';
  if not found then
    create trigger set_updated_at_profiles before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_cities';
  if not found then
    create trigger set_updated_at_cities before update on public.cities
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_partners';
  if not found then
    create trigger set_updated_at_partners before update on public.partners
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_shop_part_offers';
  if not found then
    create trigger set_updated_at_shop_part_offers before update on public.shop_part_offers
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_requests';
  if not found then
    create trigger set_updated_at_requests before update on public.requests
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_reviews';
  if not found then
    create trigger set_updated_at_reviews before update on public.reviews
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_offers';
  if not found then
    create trigger set_updated_at_offers before update on public.offers
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_orders';
  if not found then
    create trigger set_updated_at_orders before update on public.orders
    for each row execute function public.set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_complaints';
  if not found then
    create trigger set_updated_at_complaints before update on public.complaints
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Тригери для рейтингу
do $$
begin
  perform 1 from pg_trigger where tgname = 'refresh_partner_rating_after_review';
  if not found then
    create trigger refresh_partner_rating_after_review
    after insert or update or delete on public.reviews
    for each row execute function public.refresh_partner_rating();
  end if;
end $$;

-- Тригери статусів оффер/ордер
do $$
begin
  perform 1 from pg_trigger where tgname = 'on_offer_status_change_trg';
  if not found then
    create trigger on_offer_status_change_trg
    after update on public.offers
    for each row
    when (old.status is distinct from new.status and new.status = 'accepted')
    execute function public.on_offer_status_change();
  end if;

  perform 1 from pg_trigger where tgname = 'on_order_status_change_trg';
  if not found then
    create trigger on_order_status_change_trg
    after update on public.orders
    for each row
    when (old.status is distinct from new.status)
    execute function public.on_order_status_change();
  end if;
end $$;

-- Seed дані

-- Міста (обласні центри)
insert into public.cities (id, name_ua, name_en, slug, region_ua, lat, lng)
values
  (gen_random_uuid(),'Київ','Kyiv','kyiv','Київська',50.4501,30.5234),
  (gen_random_uuid(),'Львів','Lviv','lviv','Львівська',49.8397,24.0297),
  (gen_random_uuid(),'Харків','Kharkiv','kharkiv','Харківська',49.9935,36.2304),
  (gen_random_uuid(),'Одеса','Odesa','odesa','Одеська',46.4825,30.7233),
  (gen_random_uuid(),'Дніпро','Dnipro','dnipro','Дніпропетровська',48.4647,35.0462),
  (gen_random_uuid(),'Запоріжжя','Zaporizhzhia','zaporizhzhia','Запорізька',47.8388,35.1396),
  (gen_random_uuid(),'Миколаїв','Mykolaiv','mykolaiv','Миколаївська',46.9750,31.9946),
  (gen_random_uuid(),'Херсон','Kherson','kherson','Херсонська',46.6354,32.6169),
  (gen_random_uuid(),'Черкаси','Cherkasy','cherkasy','Черкаська',49.4444,32.0598),
  (gen_random_uuid(),'Чернігів','Chernihiv','chernihiv','Чернігівська',51.4982,31.2893),
  (gen_random_uuid(),'Суми','Sumy','sumy','Сумська',50.9077,34.7981),
  (gen_random_uuid(),'Полтава','Poltava','poltava','Полтавська',49.5883,34.5514),
  (gen_random_uuid(),'Кропивницький','Kropyvnytskyi','kropyvnytskyi','Кіровоградська',48.5079,32.2623),
  (gen_random_uuid(),'Житомир','Zhytomyr','zhytomyr','Житомирська',50.2547,28.6587),
  (gen_random_uuid(),'Вінниця','Vinnytsia','vinnytsia','Вінницька',49.2331,28.4682),
  (gen_random_uuid(),'Хмельницький','Khmelnytskyi','khmelnytskyi','Хмельницька',49.4229,26.9871),
  (gen_random_uuid(),'Тернопіль','Ternopil','ternopil','Тернопільська',49.5535,25.5948),
  (gen_random_uuid(),'Івано-Франківськ','Ivano-Frankivsk','ivano-frankivsk','Івано-Франківська',48.9226,24.7111),
  (gen_random_uuid(),'Ужгород','Uzhhorod','uzhhorod','Закарпатська',48.6208,22.2879),
  (gen_random_uuid(),'Луцьк','Lutsk','lutsk','Волинська',50.7472,25.3254),
  (gen_random_uuid(),'Рівне','Rivne','rivne','Рівненська',50.6199,26.2516),
  (gen_random_uuid(),'Чернівці','Chernivtsi','chernivtsi','Чернівецька',48.2915,25.9403),
  (gen_random_uuid(),'Донецьк','Donetsk','donetsk','Донецька',48.0159,37.8029),
  (gen_random_uuid(),'Луганськ','Luhansk','luhansk','Луганська',48.5740,39.3078)
on conflict (slug) do nothing;

-- Послуги СТО
insert into public.services (id, name_ua, slug, category, is_active) values
  (gen_random_uuid(),'Діагностика','diagnostyka','діагностика',true),
  (gen_random_uuid(),'Ходова','khodova','ходова',true),
  (gen_random_uuid(),'Заміна масла','zamina-masla','двигун',true),
  (gen_random_uuid(),'Гальма','halma','гальма',true),
  (gen_random_uuid(),'Електрика','elektryka','електрика',true),
  (gen_random_uuid(),'Кузовні роботи','kuzovni-roboty','кузов',true),
  (gen_random_uuid(),'Кондиціонери','kondytsionery','електрика',true),
  (gen_random_uuid(),'Шиномонтаж','shynomontazh','ходова',true),
  (gen_random_uuid(),'Розвал-сходження','rozval-shodzhennia','ходова',true)
on conflict (slug) do nothing;

-- Категорії запчастин
insert into public.part_categories (id, name_ua, slug, is_active) values
  (gen_random_uuid(),'Гальмівна система','halmivna-systema','гальма',true),
  (gen_random_uuid(),'Підвіска','pidviska','ходова',true),
  (gen_random_uuid(),'Двигун','dvyhun','двигун',true),
  (gen_random_uuid(),'Фільтри','filtry','фільтри',true),
  (gen_random_uuid(),'Масла та рідини','masla-ta-ridyny','масла',true),
  (gen_random_uuid(),'Електрика','elektryka-detal','електрика',true),
  (gen_random_uuid(),'Кузов','kuzov','кузов',true),
  (gen_random_uuid(),'Охолодження','okholodzhennia','охолодження',true),
  (gen_random_uuid(),'Трансмісія','transmisiia','трансмісія',true),
  (gen_random_uuid(),'Шини/диски','shyny-dysky','шини',true)
on conflict (slug) do nothing;

-- Бренди авто
insert into public.car_brands (id, name, slug) values
  (gen_random_uuid(),'Volkswagen','volkswagen'),
  (gen_random_uuid(),'Audi','audi'),
  (gen_random_uuid(),'BMW','bmw'),
  (gen_random_uuid(),'Mercedes-Benz','mercedes-benz'),
  (gen_random_uuid(),'Toyota','toyota'),
  (gen_random_uuid(),'Renault','renault'),
  (gen_random_uuid(),'Skoda','skoda'),
  (gen_random_uuid(),'Ford','ford'),
  (gen_random_uuid(),'Hyundai','hyundai'),
  (gen_random_uuid(),'Kia','kia'),
  (gen_random_uuid(),'Nissan','nissan'),
  (gen_random_uuid(),'Opel','opel'),
  (gen_random_uuid(),'Peugeot','peugeot'),
  (gen_random_uuid(),'Citroen','citroen'),
  (gen_random_uuid(),'Honda','honda'),
  (gen_random_uuid(),'Mazda','mazda'),
  (gen_random_uuid(),'Mitsubishi','mitsubishi'),
  (gen_random_uuid(),'Volvo','volvo'),
  (gen_random_uuid(),'Chevrolet','chevrolet'),
  (gen_random_uuid(),'Seat','seat'),
  (gen_random_uuid(),'Fiat','fiat'),
  (gen_random_uuid(),'Subaru','subaru'),
  (gen_random_uuid(),'Suzuki','suzuki'),
  (gen_random_uuid(),'Lexus','lexus'),
  (gen_random_uuid(),'Dacia','dacia')
on conflict (slug) do nothing;

-- Хелпер для перевірки ролі admin (використовується в політиках)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Тригер для оновлення середньої оцінки партнера після змін у відгуках
create or replace function public.refresh_partner_rating()
returns trigger
language plpgsql
as $$
declare
  target_partner uuid := coalesce(new.partner_id, old.partner_id);
begin
  update public.partners p
  set rating_avg = coalesce(sub.avg_rating, 0),
      rating_count = coalesce(sub.cnt, 0),
      updated_at = timezone('utc', now())
  from (
    select target_partner as partner_id,
           avg(r.rating)::numeric(3,2) as avg_rating,
           count(r.*) as cnt
    from public.reviews r
    where r.partner_id = target_partner
      and r.status = 'published'
  ) sub
  where p.id = target_partner;
  return null;
end;
$$;

-- Політики RLS

-- Увімкнути RLS
alter table public.cities enable row level security;
alter table public.services enable row level security;
alter table public.part_categories enable row level security;
alter table public.car_brands enable row level security;
alter table public.car_models enable row level security;
alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.partner_services enable row level security;
alter table public.partner_car_compatibility enable row level security;
alter table public.shop_part_offers enable row level security;
alter table public.requests enable row level security;
alter table public.reviews enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.complaints enable row level security;

-- Публічне читання довідників
create policy if not exists cities_public_select on public.cities
  for select using (is_active = true);

create policy if not exists cities_admin_all on public.cities
  using (is_admin())
  with check (is_admin());

create policy if not exists services_public_select on public.services
  for select using (is_active = true);

create policy if not exists services_admin_all on public.services
  using (is_admin())
  with check (is_admin());

create policy if not exists part_categories_public_select on public.part_categories
  for select using (is_active = true);

create policy if not exists part_categories_admin_all on public.part_categories
  using (is_admin())
  with check (is_admin());

create policy if not exists car_brands_public_select on public.car_brands
  for select using (true);

create policy if not exists car_brands_admin_all on public.car_brands
  using (is_admin())
  with check (is_admin());

create policy if not exists car_models_public_select on public.car_models
  for select using (true);

create policy if not exists car_models_admin_all on public.car_models
  using (is_admin())
  with check (is_admin());

-- Partners: публічний доступ лише до активних
create policy if not exists partners_public_select on public.partners
  for select using (status = 'active');

-- Partners: оновлення лише власник або адмін
create policy if not exists partners_owner_update on public.partners
  for update using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

create policy if not exists partners_owner_delete on public.partners
  for delete using (owner_profile_id = auth.uid());

create policy if not exists partners_owner_insert on public.partners
  for insert with check (owner_profile_id = auth.uid());

create policy if not exists partners_admin_all on public.partners
  using (is_admin())
  with check (is_admin());

-- Partner services: публічний select для активних партнерів
create policy if not exists partner_services_public_select on public.partner_services
  for select using (
    exists (
      select 1 from public.partners p
      where p.id = partner_services.partner_id and p.status = 'active'
    )
  );

-- Partner services: CRUD власник або адмін
create policy if not exists partner_services_owner_all on public.partner_services
  using (
    exists (
      select 1 from public.partners p
      where p.id = partner_services.partner_id and p.owner_profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.partners p
      where p.id = partner_services.partner_id and p.owner_profile_id = auth.uid()
    )
  );

create policy if not exists partner_services_admin_all on public.partner_services
  using (is_admin())
  with check (is_admin());

-- Partner car compatibility: публічний select активних партнерів
create policy if not exists partner_car_compatibility_public_select on public.partner_car_compatibility
  for select using (
    exists (
      select 1 from public.partners p
      where p.id = partner_car_compatibility.partner_id and p.status = 'active'
    )
  );

-- CRUD для власника або адміна
create policy if not exists partner_car_compatibility_owner_all on public.partner_car_compatibility
  using (
    exists (
      select 1 from public.partners p
      where p.id = partner_car_compatibility.partner_id and p.owner_profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.partners p
      where p.id = partner_car_compatibility.partner_id and p.owner_profile_id = auth.uid()
    )
  );

create policy if not exists partner_car_compatibility_admin_all on public.partner_car_compatibility
  using (is_admin())
  with check (is_admin());

-- Shop part offers: публічний select активних партнерів
create policy if not exists shop_part_offers_public_select on public.shop_part_offers
  for select using (
    exists (
      select 1 from public.partners p
      where p.id = shop_part_offers.partner_id and p.status = 'active'
    )
  );

-- CRUD для власника магазину або адміна
create policy if not exists shop_part_offers_owner_all on public.shop_part_offers
  using (
    exists (
      select 1 from public.partners p
      where p.id = shop_part_offers.partner_id and p.owner_profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.partners p
      where p.id = shop_part_offers.partner_id and p.owner_profile_id = auth.uid()
    )
  );

create policy if not exists shop_part_offers_admin_all on public.shop_part_offers
  using (is_admin())
  with check (is_admin());

-- Offers: партнери та клієнт заявки + адмін
create policy if not exists offers_partner_all on public.offers
  using (
    exists (
      select 1 from public.partners p
      where p.id = offers.partner_id and p.owner_profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.partners p
      where p.id = offers.partner_id and p.owner_profile_id = auth.uid()
    )
  );

create policy if not exists offers_client_select on public.offers
  for select using (
    exists (
      select 1 from public.requests r
      where r.id = offers.request_id and r.client_profile_id = auth.uid()
    )
  );

create policy if not exists offers_admin_all on public.offers
  using (is_admin())
  with check (is_admin());

-- Orders: клієнт та партнер по угоді + адмін
create policy if not exists orders_client_partner_select on public.orders
  for select using (
    client_id = auth.uid()
    or exists (
      select 1 from public.partners p where p.id = public.orders.partner_id and p.owner_profile_id = auth.uid()
    )
  );

create policy if not exists orders_client_partner_update on public.orders
  for update using (
    client_id = auth.uid()
    or exists (
      select 1 from public.partners p where p.id = public.orders.partner_id and p.owner_profile_id = auth.uid()
    )
  )
  with check (true);

create policy if not exists orders_admin_all on public.orders
  using (is_admin())
  with check (is_admin());

-- Messages: учасники заявки або адмін
create policy if not exists messages_participants_select on public.messages
  for select using (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (r.client_profile_id = auth.uid()
             or exists (
               select 1 from public.partners p where p.id = any(
                 array(select partner_id from public.offers o where o.request_id = r.id)
               ) and p.owner_profile_id = auth.uid()
             )
        )
    )
  );

create policy if not exists messages_participants_insert on public.messages
  for insert with check (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (r.client_profile_id = auth.uid()
             or exists (
               select 1 from public.partners p where p.id = any(
                 array(select partner_id from public.offers o where o.request_id = r.id)
               ) and p.owner_profile_id = auth.uid()
             )
        )
    )
  );

create policy if not exists messages_admin_all on public.messages
  using (is_admin())
  with check (is_admin());

-- Complaints: автор бачить свої, адмін усе
create policy if not exists complaints_actor_select on public.complaints
  for select using (actor_profile_id = auth.uid());

create policy if not exists complaints_actor_insert on public.complaints
  for insert with check (actor_profile_id = auth.uid());

create policy if not exists complaints_admin_all on public.complaints
  using (is_admin())
  with check (is_admin());

-- Profiles: власник бачить/оновлює себе, адмін все
create policy if not exists profiles_self_select on public.profiles
  for select using (id = auth.uid());

create policy if not exists profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy if not exists profiles_self_insert on public.profiles
  for insert with check (id = auth.uid());

create policy if not exists profiles_admin_all on public.profiles
  using (is_admin())
  with check (is_admin());

-- Requests: публічне читання заборонене, клієнт бачить тільки свої, адмін все
create policy if not exists requests_client_select on public.requests
  for select using (client_profile_id = auth.uid());

create policy if not exists requests_client_insert on public.requests
  for insert with check (client_profile_id = auth.uid());

create policy if not exists requests_client_update_new on public.requests
  for update using (client_profile_id = auth.uid() and status = 'new')
  with check (client_profile_id = auth.uid());

create policy if not exists requests_admin_all on public.requests
  using (is_admin())
  with check (is_admin());

-- Reviews: публічний select тільки опублікованих; власник бачить свої; адмін все
create policy if not exists reviews_public_select_published on public.reviews
  for select using (status = 'published');

create policy if not exists reviews_owner_select on public.reviews
  for select using (client_profile_id = auth.uid());

create policy if not exists reviews_owner_insert on public.reviews
  for insert with check (client_profile_id = auth.uid());

create policy if not exists reviews_owner_update_pending on public.reviews
  for update using (client_profile_id = auth.uid() and status = 'pending')
  with check (client_profile_id = auth.uid());

create policy if not exists reviews_admin_all on public.reviews
  using (is_admin())
  with check (is_admin());

-- Гостьове читання списків (partners already handled above)
-- додаткові дозволи для анонімних користувачів: city/service/categories/brands/models вже покрито.

-- Рекомендація щодо slug: на рівні БД забезпечується унікальність через UNIQUE; генерацію робити на application layer.
