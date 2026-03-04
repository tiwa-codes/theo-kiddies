-- ============================================================
-- Theo Kiddies – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Orders: one row per successful Paystack payment
create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  reference   text unique not null,
  amount      numeric(12, 2) not null,
  currency    text not null default 'NGN',
  email       text not null,
  items       jsonb not null default '[]',
  status      text not null default 'paid',
  created_at  timestamptz not null default now()
);

-- Customers: one row per unique email, upserted on each order
create table if not exists customers (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  order_count  integer not null default 1,
  total_spent  numeric(12, 2) not null default 0,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now()
);

-- Index for fast admin queries
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_email_idx on orders (email);
create index if not exists customers_total_spent_idx on customers (total_spent desc);

-- Row Level Security (RLS): only service role key can read/write
alter table orders  enable row level security;
alter table customers enable row level security;

-- ============================================================
-- Products: managed from /admin/products
-- ============================================================
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  price            numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  badge            text,
  age_group        text not null,
  category         text not null,
  images           jsonb not null default '[]',
  colors           jsonb not null default '[]',
  sizes            jsonb not null default '[]',
  in_stock         boolean not null default true,
  rating           numeric(3, 1) not null default 5.0,
  reviews          integer not null default 0,
  description      text,
  created_at       timestamptz not null default now()
);

-- Index for fast storefront queries
create index if not exists products_category_idx  on products (category);
create index if not exists products_age_group_idx on products (age_group);
create index if not exists products_in_stock_idx  on products (in_stock);
create index if not exists products_created_at_idx on products (created_at desc);

-- RLS: public can read, only service role can write
alter table products enable row level security;

create policy "Public can read products"
  on products for select
  using (true);
