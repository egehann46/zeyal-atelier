-- Supabase products şeması
create extension if not exists pgcrypto;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  image_url text,
  categories text[] default '{}',
  created_at timestamp with time zone default now()
);
alter table public.products enable row level security;
-- anon role'a select/insert/update/delete izni (service role yoksa)
drop policy if exists anon_all on public.products;
create policy anon_all on public.products for all to anon using (true) with check (true);
-- Ek alanlar (varsa tekrar eklemeye calismaz)
alter table public.products add column if not exists image_urls text[];
alter table public.products add column if not exists dimensions text;
alter table public.products add column if not exists color text;
alter table public.products add column if not exists volume text;
-- Stok adedi kolonu: default'ı kaldır ve null'a izin ver
alter table public.products add column if not exists stock integer;
alter table public.products alter column stock drop default;
