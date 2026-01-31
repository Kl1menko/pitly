-- =========================================
-- SUPABASE SCHEMA (IDEMPOTENT) + SEEDS
-- Fixes:
-- 1) No subqueries in CHECK constraints (replaced by triggers)
-- 2) requests.status supports 'new' (default 'new') + aligned RLS
-- 3) Policies are idempotent (DROP POLICY IF EXISTS ...)
-- 4) Seed order fixed (car_brands -> car_models)
-- 5) Auto-create profile row on auth.users insert
-- 6) part_categories has category column (seed uses it)
-- =========================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =========================================
-- TABLES
-- =========================================

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

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  category text,
  is_active boolean not null default true
);

-- partner_services (NO cross-table CHECK; enforced by trigger)
create table if not exists public.partner_services (
  partner_id uuid not null references public.partners(id) on delete cascade,
  service_id uuid not null references public.services(id),
  price_from numeric,
  primary key (partner_id, service_id)
);
create index if not exists partner_services_service_id_idx on public.partner_services(service_id);

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

create table if not exists public.partner_car_compatibility (
  partner_id uuid not null references public.partners(id) on delete cascade,
  brand_id uuid not null references public.car_brands(id),
  model_id uuid references public.car_models(id),
  primary key (partner_id, brand_id, model_id)
);
create index if not exists partner_car_compatibility_brand_idx on public.partner_car_compatibility(brand_id);
create index if not exists partner_car_compatibility_model_idx on public.partner_car_compatibility(model_id);

-- part_categories (added category column)
create table if not exists public.part_categories (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  category text,
  is_active boolean not null default true
);

-- shop_part_offers (NO cross-table CHECK; enforced by trigger)
create table if not exists public.shop_part_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  category_id uuid not null references public.part_categories(id),
  brand_id uuid references public.car_brands(id),
  note text,
  delivery_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists shop_part_offers_partner_category_idx on public.shop_part_offers(partner_id, category_id);
create index if not exists shop_part_offers_brand_idx on public.shop_part_offers(brand_id);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.profiles(id),
  type text not null check (type in ('repair','parts')),
  city_id uuid not null references public.cities(id),

  car_brand_id uuid references public.car_brands(id),
  car_model_id uuid references public.car_models(id),

  -- additional fields used by UI/forms
  car_model_name text,
  car_year int2,
  vin text,

  part_category_id uuid references public.part_categories(id),
  extra_part_categories text[] not null default '{}'::text[],

  part_query text,

  service_id uuid references public.services(id),
  extra_services text[] not null default '{}'::text[],

  problem_description text,
  photos jsonb not null default '[]'::jsonb,
  contact_phone text not null,
  contact_name text,
  preferred_time text,

  status text not null default 'new' check (
    status in (
      'new','draft','published','offers_collecting','client_selected_offer',
      'in_progress','done','cancelled','expired'
    )
  ),

  target_partner_id uuid references public.partners(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists requests_type_city_status_idx on public.requests(type, city_id, status);
create index if not exists requests_client_profile_idx on public.requests(client_profile_id);
create index if not exists requests_target_partner_idx on public.requests(target_partner_id);

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

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists messages_request_idx on public.messages(request_id);
create index if not exists messages_sender_idx on public.messages(sender_id);

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

-- =========================================
-- FUNCTIONS
-- =========================================

-- Admin check
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

-- Enforce partner type (sto/shop) via triggers
create or replace function public.enforce_partner_type()
returns trigger
language plpgsql
as $$
declare
  expected_type text := tg_argv[0];
  actual_type   text;
begin
  if new.partner_id is null then
    return new;
  end if;

  select p.type into actual_type
  from public.partners p
  where p.id = new.partner_id;

  if actual_type is null then
    raise exception 'partner_id % does not exist in public.partners', new.partner_id;
  end if;

  if actual_type <> expected_type then
    raise exception 'partner_id % must reference a partner with type = % (got %)',
      new.partner_id, expected_type, actual_type;
  end if;

  return new;
end;
$$;

-- Ratings recalculation
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

-- Offer status changes
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
        and status in ('new','draft','published','offers_collecting','in_progress');

    insert into public.orders (request_id, offer_id, client_id, partner_id)
    select r.id, new.id, r.client_profile_id, new.partner_id
    from public.requests r
    where r.id = new.request_id
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- Order status changes
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

-- Auto-create profile on sign up (auth.users -> public.profiles)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, created_at, updated_at)
  values (new.id, 'client', timezone('utc', now()), timezone('utc', now()))
  on conflict (id) do nothing;

  return new;
end;
$$;

-- =========================================
-- TRIGGERS
-- =========================================

-- updated_at triggers
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_profiles') then
    create trigger set_updated_at_profiles
      before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_cities') then
    create trigger set_updated_at_cities
      before update on public.cities
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_partners') then
    create trigger set_updated_at_partners
      before update on public.partners
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_shop_part_offers') then
    create trigger set_updated_at_shop_part_offers
      before update on public.shop_part_offers
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_requests') then
    create trigger set_updated_at_requests
      before update on public.requests
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_reviews') then
    create trigger set_updated_at_reviews
      before update on public.reviews
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_offers') then
    create trigger set_updated_at_offers
      before update on public.offers
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_orders') then
    create trigger set_updated_at_orders
      before update on public.orders
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_complaints') then
    create trigger set_updated_at_complaints
      before update on public.complaints
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- Enforce partner type for partner_services/shop_part_offers
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_partner_services_partner_is_sto') then
    create trigger trg_partner_services_partner_is_sto
      before insert or update of partner_id
      on public.partner_services
      for each row
      execute function public.enforce_partner_type('sto');
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_shop_part_offers_partner_is_shop') then
    create trigger trg_shop_part_offers_partner_is_shop
      before insert or update of partner_id
      on public.shop_part_offers
      for each row
      execute function public.enforce_partner_type('shop');
  end if;
end $$;

-- Ratings and status triggers
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'refresh_partner_rating_after_review') then
    create trigger refresh_partner_rating_after_review
      after insert or update or delete on public.reviews
      for each row execute function public.refresh_partner_rating();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'on_offer_status_change_trg') then
    create trigger on_offer_status_change_trg
      after update on public.offers
      for each row
      when (old.status is distinct from new.status and new.status = 'accepted')
      execute function public.on_offer_status_change();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'on_order_status_change_trg') then
    create trigger on_order_status_change_trg
      after update on public.orders
      for each row
      when (old.status is distinct from new.status)
      execute function public.on_order_status_change();
  end if;
end $$;

-- auth.users -> profiles trigger
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'auth')
     and exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='auth' and c.relname='users')
  then
    if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute function public.handle_new_user();
    end if;
  end if;
end $$;

-- Guest requests: allow inserts without auth (client_profile_id nullable) while keeping owner RLS
do $$
begin
  -- allow NULL in client_profile_id for guest submissions
  alter table public.requests alter column client_profile_id drop not null;

  -- drop old insert policies to avoid duplicates
  drop policy if exists requests_client_insert on public.requests;
  drop policy if exists requests_anon_insert on public.requests;
  drop policy if exists requests_any_insert on public.requests;
  drop policy if exists requests_unrestricted_insert on public.requests;

  -- allow authenticated clients to insert their own (if they pass client_profile_id = auth.uid())
  create policy requests_client_insert on public.requests
    for insert with check (client_profile_id = auth.uid());

  -- allow guests (anon role) to insert rows without client_profile_id (NULL)
  create policy requests_anon_insert on public.requests
    for insert with check (auth.role() = 'anon' and client_profile_id is null);

  -- fail‑safe: allow both anon & authenticated to insert while other policies stabilize
  create policy requests_any_insert on public.requests
    for insert with check (auth.role() in ('anon','authenticated'));

  -- emergency open insert (remove in production when policies above are confirmed)
  create policy requests_unrestricted_insert on public.requests
    for insert with check (true);
end $$;

-- =========================================
-- SEEDS (order matters)
-- =========================================

-- Cities
insert into public.cities (id, name_ua, name_en, slug, region_ua, lat, lng) values
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

-- Services
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

-- Part categories
insert into public.part_categories (id, name_ua, slug, category, is_active) values
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

-- Car brands (MUST be before car_models seed)
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

-- Car models (seed by brand slug)
insert into public.car_models (brand_id, name, slug)
select b.id, v.name, v.slug
from public.car_brands b
join (
  values
    -- Volkswagen
    ('volkswagen','Golf','golf'),
    ('volkswagen','Passat','passat'),
    ('volkswagen','Polo','polo'),
    ('volkswagen','Tiguan','tiguan'),
    ('volkswagen','Touareg','touareg'),

    -- Audi
    ('audi','A3','a3'),
    ('audi','A4','a4'),
    ('audi','A6','a6'),
    ('audi','Q5','q5'),
    ('audi','Q7','q7'),

    -- BMW
    ('bmw','3 Series','3-series'),
    ('bmw','5 Series','5-series'),
    ('bmw','X3','x3'),
    ('bmw','X5','x5'),
    ('bmw','X1','x1'),

    -- Mercedes-Benz
    ('mercedes-benz','C-Class','c-class'),
    ('mercedes-benz','E-Class','e-class'),
    ('mercedes-benz','S-Class','s-class'),
    ('mercedes-benz','GLC','glc'),
    ('mercedes-benz','GLE','gle'),

    -- Toyota
    ('toyota','Corolla','corolla'),
    ('toyota','Camry','camry'),
    ('toyota','RAV4','rav4'),
    ('toyota','Land Cruiser','land-cruiser'),
    ('toyota','Yaris','yaris'),

    -- Renault
    ('renault','Clio','clio'),
    ('renault','Megane','megane'),
    ('renault','Captur','captur'),
    ('renault','Kadjar','kadjar'),
    ('renault','Trafic','trafic'),

    -- Skoda
    ('skoda','Octavia','octavia'),
    ('skoda','Fabia','fabia'),
    ('skoda','Superb','superb'),
    ('skoda','Kodiaq','kodiaq'),
    ('skoda','Rapid','rapid'),

    -- Ford
    ('ford','Focus','focus'),
    ('ford','Fiesta','fiesta'),
    ('ford','Mondeo','mondeo'),
    ('ford','Kuga','kuga'),
    ('ford','Transit','transit'),

    -- Hyundai
    ('hyundai','Elantra','elantra'),
    ('hyundai','i30','i30'),
    ('hyundai','Tucson','tucson'),
    ('hyundai','Santa Fe','santa-fe'),
    ('hyundai','Accent','accent'),

    -- Kia
    ('kia','Ceed','ceed'),
    ('kia','Sportage','sportage'),
    ('kia','Rio','rio'),
    ('kia','Sorento','sorento'),
    ('kia','K5 (Optima)','k5'),

    -- Nissan
    ('nissan','Qashqai','qashqai'),
    ('nissan','X-Trail','x-trail'),
    ('nissan','Juke','juke'),
    ('nissan','Leaf','leaf'),
    ('nissan','Navara','navara'),

    -- Opel
    ('opel','Astra','astra'),
    ('opel','Insignia','insignia'),
    ('opel','Corsa','corsa'),
    ('opel','Zafira','zafira'),
    ('opel','Mokka','mokka'),

    -- Peugeot
    ('peugeot','208','208'),
    ('peugeot','308','308'),
    ('peugeot','3008','3008'),
    ('peugeot','508','508'),
    ('peugeot','Partner','partner'),

    -- Citroen
    ('citroen','C3','c3'),
    ('citroen','C4','c4'),
    ('citroen','Berlingo','berlingo'),
    ('citroen','C5 Aircross','c5-aircross'),
    ('citroen','Jumper','jumper'),

    -- Honda
    ('honda','Civic','civic'),
    ('honda','Accord','accord'),
    ('honda','CR-V','cr-v'),
    ('honda','HR-V','hr-v'),
    ('honda','Jazz','jazz'),

    -- Mazda
    ('mazda','Mazda 3','3'),
    ('mazda','Mazda 6','6'),
    ('mazda','CX-5','cx-5'),
    ('mazda','CX-30','cx-30'),
    ('mazda','CX-9','cx-9'),

    -- Mitsubishi
    ('mitsubishi','Lancer','lancer'),
    ('mitsubishi','Outlander','outlander'),
    ('mitsubishi','ASX','asx'),
    ('mitsubishi','Pajero','pajero'),
    ('mitsubishi','L200','l200'),

    -- Volvo
    ('volvo','XC60','xc60'),
    ('volvo','XC90','xc90'),
    ('volvo','S60','s60'),
    ('volvo','V60','v60'),
    ('volvo','V40','v40'),

    -- Chevrolet
    ('chevrolet','Cruze','cruze'),
    ('chevrolet','Aveo','aveo'),
    ('chevrolet','Captiva','captiva'),
    ('chevrolet','Niva','niva'),
    ('chevrolet','Camaro','camaro'),

    -- Seat
    ('seat','Leon','leon'),
    ('seat','Ibiza','ibiza'),
    ('seat','Ateca','ateca'),
    ('seat','Toledo','toledo'),
    ('seat','Alhambra','alhambra'),

    -- Fiat
    ('fiat','500','500'),
    ('fiat','Punto','punto'),
    ('fiat','Tipo','tipo'),
    ('fiat','Doblo','doblo'),
    ('fiat','Ducato','ducato'),

    -- Subaru
    ('subaru','Impreza','impreza'),
    ('subaru','Forester','forester'),
    ('subaru','Outback','outback'),
    ('subaru','XV','xv'),
    ('subaru','Legacy','legacy'),

    -- Suzuki
    ('suzuki','Swift','swift'),
    ('suzuki','Vitara','vitara'),
    ('suzuki','Jimny','jimny'),
    ('suzuki','SX4','sx4'),
    ('suzuki','S-Cross','s-cross'),

    -- Lexus
    ('lexus','RX','rx'),
    ('lexus','NX','nx'),
    ('lexus','ES','es'),
    ('lexus','IS','is'),
    ('lexus','GX','gx'),

    -- Dacia
    ('dacia','Logan','logan'),
    ('dacia','Sandero','sandero'),
    ('dacia','Duster','duster'),
    ('dacia','Lodgy','lodgy'),
    ('dacia','Dokker','dokker')
) as v(brand_slug, name, slug)
  on b.slug = v.brand_slug
on conflict (brand_id, slug) do nothing;

-- =========================================
-- RLS ENABLE
-- =========================================
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

-- =========================================
-- POLICIES (DROP THEN CREATE) – NO DUPLICATES
-- =========================================

-- cities
drop policy if exists cities_public_select on public.cities;
drop policy if exists cities_admin_all on public.cities;

create policy cities_public_select on public.cities
  for select using (is_active = true);

create policy cities_admin_all on public.cities
  using (is_admin()) with check (is_admin());

-- services
drop policy if exists services_public_select on public.services;
drop policy if exists services_admin_all on public.services;

create policy services_public_select on public.services
  for select using (is_active = true);

create policy services_admin_all on public.services
  using (is_admin()) with check (is_admin());

-- part_categories
drop policy if exists part_categories_public_select on public.part_categories;
drop policy if exists part_categories_admin_all on public.part_categories;

create policy part_categories_public_select on public.part_categories
  for select using (is_active = true);

create policy part_categories_admin_all on public.part_categories
  using (is_admin()) with check (is_admin());

-- car_brands
drop policy if exists car_brands_public_select on public.car_brands;
drop policy if exists car_brands_admin_all on public.car_brands;

create policy car_brands_public_select on public.car_brands
  for select using (true);

create policy car_brands_admin_all on public.car_brands
  using (is_admin()) with check (is_admin());

-- car_models
drop policy if exists car_models_public_select on public.car_models;
drop policy if exists car_models_admin_all on public.car_models;

create policy car_models_public_select on public.car_models
  for select using (true);

create policy car_models_admin_all on public.car_models
  using (is_admin()) with check (is_admin());

-- partners
drop policy if exists partners_public_select on public.partners;
drop policy if exists partners_owner_update on public.partners;
drop policy if exists partners_owner_delete on public.partners;
drop policy if exists partners_owner_insert on public.partners;
drop policy if exists partners_admin_all on public.partners;

create policy partners_public_select on public.partners
  for select using (status = 'active');

create policy partners_owner_update on public.partners
  for update using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

create policy partners_owner_delete on public.partners
  for delete using (owner_profile_id = auth.uid());

create policy partners_owner_insert on public.partners
  for insert with check (owner_profile_id = auth.uid());

create policy partners_admin_all on public.partners
  using (is_admin()) with check (is_admin());

-- partner_services
drop policy if exists partner_services_public_select on public.partner_services;
drop policy if exists partner_services_owner_all on public.partner_services;
drop policy if exists partner_services_admin_all on public.partner_services;

create policy partner_services_public_select on public.partner_services
  for select using (
    exists (select 1 from public.partners p where p.id = partner_services.partner_id and p.status = 'active')
  );

create policy partner_services_owner_all on public.partner_services
  using (
    exists (select 1 from public.partners p where p.id = partner_services.partner_id and p.owner_profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.partners p where p.id = partner_services.partner_id and p.owner_profile_id = auth.uid())
  );

create policy partner_services_admin_all on public.partner_services
  using (is_admin()) with check (is_admin());

-- partner_car_compatibility
drop policy if exists partner_car_compatibility_public_select on public.partner_car_compatibility;
drop policy if exists partner_car_compatibility_owner_all on public.partner_car_compatibility;
drop policy if exists partner_car_compatibility_admin_all on public.partner_car_compatibility;

create policy partner_car_compatibility_public_select on public.partner_car_compatibility
  for select using (
    exists (select 1 from public.partners p where p.id = partner_car_compatibility.partner_id and p.status = 'active')
  );

create policy partner_car_compatibility_owner_all on public.partner_car_compatibility
  using (
    exists (select 1 from public.partners p where p.id = partner_car_compatibility.partner_id and p.owner_profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.partners p where p.id = partner_car_compatibility.partner_id and p.owner_profile_id = auth.uid())
  );

create policy partner_car_compatibility_admin_all on public.partner_car_compatibility
  using (is_admin()) with check (is_admin());

-- shop_part_offers
drop policy if exists shop_part_offers_public_select on public.shop_part_offers;
drop policy if exists shop_part_offers_owner_all on public.shop_part_offers;
drop policy if exists shop_part_offers_admin_all on public.shop_part_offers;

create policy shop_part_offers_public_select on public.shop_part_offers
  for select using (
    exists (select 1 from public.partners p where p.id = shop_part_offers.partner_id and p.status = 'active')
  );

create policy shop_part_offers_owner_all on public.shop_part_offers
  using (
    exists (select 1 from public.partners p where p.id = shop_part_offers.partner_id and p.owner_profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.partners p where p.id = shop_part_offers.partner_id and p.owner_profile_id = auth.uid())
  );

create policy shop_part_offers_admin_all on public.shop_part_offers
  using (is_admin()) with check (is_admin());

-- requests
drop policy if exists requests_client_select on public.requests;
drop policy if exists requests_client_insert on public.requests;
drop policy if exists requests_client_update_new_draft on public.requests;
drop policy if exists requests_admin_all on public.requests;

create policy requests_client_select on public.requests
  for select using (client_profile_id = auth.uid());

create policy requests_client_insert on public.requests
  for insert with check (client_profile_id = auth.uid());

-- ✅ Align with schema (status includes 'new'); allow updates in 'new' and 'draft'
create policy requests_client_update_new_draft on public.requests
  for update
  using (client_profile_id = auth.uid() and status in ('new','draft'))
  with check (client_profile_id = auth.uid());

create policy requests_admin_all on public.requests
  using (is_admin()) with check (is_admin());

-- offers
drop policy if exists offers_partner_all on public.offers;
drop policy if exists offers_client_select on public.offers;
drop policy if exists offers_admin_all on public.offers;

create policy offers_partner_all on public.offers
  using (exists (select 1 from public.partners p where p.id = offers.partner_id and p.owner_profile_id = auth.uid()))
  with check (exists (select 1 from public.partners p where p.id = offers.partner_id and p.owner_profile_id = auth.uid()));

create policy offers_client_select on public.offers
  for select using (exists (select 1 from public.requests r where r.id = offers.request_id and r.client_profile_id = auth.uid()));

create policy offers_admin_all on public.offers
  using (is_admin()) with check (is_admin());

-- orders
drop policy if exists orders_client_partner_select on public.orders;
drop policy if exists orders_client_partner_update on public.orders;
drop policy if exists orders_admin_all on public.orders;

create policy orders_client_partner_select on public.orders
  for select using (
    client_id = auth.uid()
    or exists (select 1 from public.partners p where p.id = public.orders.partner_id and p.owner_profile_id = auth.uid())
  );

create policy orders_client_partner_update on public.orders
  for update using (
    client_id = auth.uid()
    or exists (select 1 from public.partners p where p.id = public.orders.partner_id and p.owner_profile_id = auth.uid())
  )
  with check (true);

create policy orders_admin_all on public.orders
  using (is_admin()) with check (is_admin());

-- messages
drop policy if exists messages_participants_select on public.messages;
drop policy if exists messages_participants_insert on public.messages;
drop policy if exists messages_admin_all on public.messages;

create policy messages_participants_select on public.messages
  for select using (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (
          r.client_profile_id = auth.uid()
          or exists (
            select 1 from public.offers o
              join public.partners p on p.id = o.partner_id
            where o.request_id = r.id and p.owner_profile_id = auth.uid()
          )
        )
    )
  );

create policy messages_participants_insert on public.messages
  for insert with check (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (
          r.client_profile_id = auth.uid()
          or exists (
            select 1 from public.offers o
              join public.partners p on p.id = o.partner_id
            where o.request_id = r.id and p.owner_profile_id = auth.uid()
          )
        )
    )
  );

create policy messages_admin_all on public.messages
  using (is_admin()) with check (is_admin());

-- complaints
drop policy if exists complaints_actor_select on public.complaints;
drop policy if exists complaints_actor_insert on public.complaints;
drop policy if exists complaints_admin_all on public.complaints;

create policy complaints_actor_select on public.complaints
  for select using (actor_profile_id = auth.uid());

create policy complaints_actor_insert on public.complaints
  for insert with check (actor_profile_id = auth.uid());

create policy complaints_admin_all on public.complaints
  using (is_admin()) with check (is_admin());

-- profiles
drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_self_insert on public.profiles;
drop policy if exists profiles_admin_all on public.profiles;

create policy profiles_self_select on public.profiles
  for select using (id = auth.uid());

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_self_insert on public.profiles
  for insert with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  using (is_admin()) with check (is_admin());

-- reviews
drop policy if exists reviews_public_select_published on public.reviews;
drop policy if exists reviews_owner_select on public.reviews;
drop policy if exists reviews_owner_insert on public.reviews;
drop policy if exists reviews_owner_update_pending on public.reviews;
drop policy if exists reviews_admin_all on public.reviews;

create policy reviews_public_select_published on public.reviews
  for select using (status = 'published');

create policy reviews_owner_select on public.reviews
  for select using (client_profile_id = auth.uid());

create policy reviews_owner_insert on public.reviews
  for insert with check (client_profile_id = auth.uid());

create policy reviews_owner_update_pending on public.reviews
  for update using (client_profile_id = auth.uid() and status = 'pending')
  with check (client_profile_id = auth.uid());

create policy reviews_admin_all on public.reviews
  using (is_admin()) with check (is_admin());
