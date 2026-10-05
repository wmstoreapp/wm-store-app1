-- wm Store: products table
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'هدايا',
  description text not null default '',
  price numeric(12, 2) not null default 0 check (price >= 0),
  discount numeric(5, 2) not null default 0 check (discount >= 0 and discount <= 100),
  image_url text not null default '',
  accent text not null default '#FFE7B3',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_created_idx
  on public.products (is_active, created_at desc);

alter table public.products enable row level security;

-- Customers can read active products only.
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

-- Admin write policies will be added after the admin auth role is configured.
-- Do not add public insert, update, or delete policies.

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_products_updated_at();
