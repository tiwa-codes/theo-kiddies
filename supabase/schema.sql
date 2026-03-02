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
