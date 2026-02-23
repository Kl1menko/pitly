-- =========================================
-- PITLY PROD RECONCILE (CORE) - 2026-02
-- Idempotent, safe to re-run
--
-- Purpose:
-- - Bring older production DBs up to the schema expected by current app code
-- - Cover core catalog/auth/request flows and Telegram auth
-- - Add denormalized FTS search for partners
--
-- Run in Supabase SQL Editor as postgres role.
-- =========================================

-- Extensions used by schema defaults/helpers
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================
-- Core tables (create if missing)
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
  telegram text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.profiles add column if not exists telegram text;
create index if not exists profiles_role_idx on public.profiles(role);
create unique index if not exists profiles_telegram_idx on public.profiles(telegram) where telegram is not null;

create table if not exists public.telegram_auth_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  code text not null,
  mode text not null check (mode in ('login','register')),
  role text not null check (role in ('client','partner_sto','partner_shop')),
  status text not null default 'pending' check (status in ('pending','bot_confirmed','consumed','expired')),
  telegram_user_id text,
  telegram_username text,
  telegram_chat_id text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists telegram_auth_tokens_status_idx on public.telegram_auth_tokens(status);
create index if not exists telegram_auth_tokens_expires_idx on public.telegram_auth_tokens(expires_at);

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

alter table public.partners add column if not exists parts_sales_enabled boolean not null default false;
alter table public.partners add column if not exists district text;
alter table public.partners add column if not exists online_booking_enabled boolean not null default false;
alter table public.partners add column if not exists booking_mode text not null default 'none';
alter table public.partners add column if not exists booking_url text;
alter table public.partners add column if not exists has_tow_service boolean not null default false;
alter table public.partners add column if not exists mobile_service boolean not null default false;
alter table public.partners add column if not exists google_place_id text;
alter table public.partners add column if not exists google_types text[] not null default '{}'::text[];
alter table public.partners add column if not exists search_text text not null default '';
alter table public.partners add column if not exists search_tsv tsvector;

create unique index if not exists partners_google_place_id_uidx on public.partners(google_place_id);
create index if not exists partners_search_tsv_gin_idx on public.partners using gin(search_tsv);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  description text,
  sort_order int2 not null default 0,
  is_active boolean not null default true
);
create index if not exists service_categories_sort_idx on public.service_categories(sort_order);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  category text,
  is_active boolean not null default true
);
alter table public.services add column if not exists category_id uuid references public.service_categories(id);
alter table public.services add column if not exists keywords text[] not null default '{}'::text[];
alter table public.services add column if not exists is_popular boolean not null default false;
alter table public.services add column if not exists sort_order int2 not null default 0;
create index if not exists services_category_id_idx on public.services(category_id);
create index if not exists services_sort_order_idx on public.services(sort_order);

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

create table if not exists public.partner_services (
  partner_id uuid not null references public.partners(id) on delete cascade,
  service_id uuid not null references public.services(id),
  price_from numeric,
  primary key (partner_id, service_id)
);
create index if not exists partner_services_service_id_idx on public.partner_services(service_id);

create table if not exists public.partner_car_compatibility (
  partner_id uuid not null references public.partners(id) on delete cascade,
  brand_id uuid not null references public.car_brands(id),
  model_id uuid references public.car_models(id),
  primary key (partner_id, brand_id, model_id)
);
create index if not exists partner_car_compatibility_brand_idx on public.partner_car_compatibility(brand_id);
create index if not exists partner_car_compatibility_model_idx on public.partner_car_compatibility(model_id);

create table if not exists public.part_categories (
  id uuid primary key default gen_random_uuid(),
  name_ua text not null,
  slug text not null unique,
  category text,
  is_active boolean not null default true
);

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
  client_profile_id uuid references public.profiles(id),
  type text not null check (type in ('repair','parts')),
  city_id uuid not null references public.cities(id),
  car_brand_id uuid references public.car_brands(id),
  car_model_id uuid references public.car_models(id),
  car_model_name text,
  car_year int2,
  vin text,
  part_category_id uuid references public.part_categories(id),
  extra_part_categories text[] not null default '{}'::text[],
  part_query text,
  service_id uuid references public.services(id),
  extra_services text[] not null default '{}'::text[],
  problem_description text,
  parts_needed boolean not null default false,
  photos jsonb not null default '[]'::jsonb,
  contact_phone text not null,
  contact_name text,
  preferred_time text,
  status text not null default 'new',
  target_partner_id uuid references public.partners(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.requests alter column client_profile_id drop not null;
create index if not exists requests_type_city_status_idx on public.requests(type, city_id, status);
create index if not exists requests_client_profile_idx on public.requests(client_profile_id);
create index if not exists requests_target_partner_idx on public.requests(target_partner_id);

create table if not exists public.request_links (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  token text not null unique,
  channel text not null check (channel in ('telegram','viber','sms','email','other')),
  contact text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists request_links_request_idx on public.request_links(request_id);
create index if not exists request_links_token_idx on public.request_links(token);
create index if not exists request_links_expires_idx on public.request_links(expires_at);

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
create unique index if not exists reviews_partner_client_uidx on public.reviews(partner_id, client_profile_id);

-- =========================================
-- Helpers / triggers used by app
-- =========================================

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
-- Partner FTS (denormalized search)
-- =========================================

create or replace function public.partner_catalog_search_text(p_partner_id uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  p_rec public.partners%rowtype;
  v_city_name text;
  v_service_text text := null;
  v_category_text text := null;
begin
  select * into p_rec
  from public.partners
  where id = p_partner_id;

  if not found then
    return '';
  end if;

  select c.name_ua into v_city_name
  from public.cities c
  where c.id = p_rec.city_id;

  -- services (keywords column may exist after alter above)
  begin
    select string_agg(
             distinct trim(concat_ws(' ', s.name_ua, coalesce(array_to_string(s.keywords, ' '), ''))),
             ' '
           )
    into v_service_text
    from public.partner_services ps
    join public.services s on s.id = ps.service_id
    where ps.partner_id = p_partner_id;
  exception
    when undefined_table then
      v_service_text := null;
    when undefined_column then
      begin
        select string_agg(distinct s.name_ua, ' ')
        into v_service_text
        from public.partner_services ps
        join public.services s on s.id = ps.service_id
        where ps.partner_id = p_partner_id;
      exception
        when undefined_table then
          v_service_text := null;
      end;
  end;

  begin
    select string_agg(distinct pc.name_ua, ' ')
    into v_category_text
    from public.shop_part_offers spo
    join public.part_categories pc on pc.id = spo.category_id
    where spo.partner_id = p_partner_id;
  exception
    when undefined_table then
      v_category_text := null;
  end;

  return trim(
    regexp_replace(
      lower(
        concat_ws(
          ' ',
          p_rec.name,
          p_rec.address,
          p_rec.district,
          p_rec.description,
          coalesce(array_to_string(p_rec.google_types, ' '), ''),
          v_city_name,
          v_service_text,
          v_category_text
        )
      ),
      '\s+',
      ' ',
      'g'
    )
  );
end;
$$;

create or replace function public.refresh_partner_catalog_search(p_partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_search_text text;
begin
  if p_partner_id is null then
    return;
  end if;

  select public.partner_catalog_search_text(p_partner_id) into v_search_text;

  update public.partners
  set
    search_text = coalesce(v_search_text, ''),
    search_tsv = to_tsvector('simple', coalesce(v_search_text, '')),
    updated_at = updated_at
  where id = p_partner_id;
end;
$$;

create or replace function public.trg_refresh_partner_catalog_search_from_partner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;
  perform public.refresh_partner_catalog_search(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

create or replace function public.trg_refresh_partner_catalog_search_from_linked_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;
  perform public.refresh_partner_catalog_search(coalesce(new.partner_id, old.partner_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.trg_refresh_partner_catalog_search_from_service()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id uuid;
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;
  for v_partner_id in
    select distinct ps.partner_id
    from public.partner_services ps
    where ps.service_id = coalesce(new.id, old.id)
  loop
    perform public.refresh_partner_catalog_search(v_partner_id);
  end loop;
  return coalesce(new, old);
end;
$$;

create or replace function public.trg_refresh_partner_catalog_search_from_part_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id uuid;
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;
  for v_partner_id in
    select distinct spo.partner_id
    from public.shop_part_offers spo
    where spo.category_id = coalesce(new.id, old.id)
  loop
    perform public.refresh_partner_catalog_search(v_partner_id);
  end loop;
  return coalesce(new, old);
end;
$$;

drop trigger if exists partners_refresh_catalog_search_trg on public.partners;
create trigger partners_refresh_catalog_search_trg
after insert or update of name, address, district, description, city_id, google_types on public.partners
for each row execute function public.trg_refresh_partner_catalog_search_from_partner();

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='partner_services') then
    drop trigger if exists partner_services_refresh_catalog_search_trg on public.partner_services;
    create trigger partner_services_refresh_catalog_search_trg
    after insert or update or delete on public.partner_services
    for each row execute function public.trg_refresh_partner_catalog_search_from_linked_rows();
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='shop_part_offers') then
    drop trigger if exists shop_part_offers_refresh_catalog_search_trg on public.shop_part_offers;
    create trigger shop_part_offers_refresh_catalog_search_trg
    after insert or update or delete on public.shop_part_offers
    for each row execute function public.trg_refresh_partner_catalog_search_from_linked_rows();
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='services') then
    drop trigger if exists services_refresh_catalog_search_trg on public.services;
    create trigger services_refresh_catalog_search_trg
    after update of name_ua, keywords on public.services
    for each row execute function public.trg_refresh_partner_catalog_search_from_service();
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='part_categories') then
    drop trigger if exists part_categories_refresh_catalog_search_trg on public.part_categories;
    create trigger part_categories_refresh_catalog_search_trg
    after update of name_ua on public.part_categories
    for each row execute function public.trg_refresh_partner_catalog_search_from_part_category();
  end if;
end $$;

-- Backfill FTS (can take time on large datasets)
update public.partners p
set
  search_text = coalesce(public.partner_catalog_search_text(p.id), ''),
  search_tsv = to_tsvector('simple', coalesce(public.partner_catalog_search_text(p.id), ''))
where true;

-- =========================================
-- Quick checks (optional; run separately if desired)
-- =========================================
-- select count(*) as partners_total, count(*) filter (where search_tsv is not null) as partners_with_tsv from public.partners;
-- select id, name from public.partners where search_tsv @@ websearch_to_tsquery('simple', 'шиномонтаж') limit 10;
