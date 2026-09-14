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

-- ============================================================
-- Site content: simple key/value store for editable homepage/admin content
-- ============================================================
create table if not exists site_content (
  key        text primary key,
  value      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_content_updated_at_idx on site_content (updated_at desc);

alter table site_content enable row level security;

-- Public read is fine for non-sensitive content like hero image URLs/text.
create policy "Public can read site content"
  on site_content for select
  using (true);

-- ============================================================
-- Blocker 04: delivery + address capture
-- ============================================================

-- Orders gain a shipping address and delivery/newsletter fields.
-- delivery_status starts 'to_be_quoted' — most states have no active rate
-- yet, since no logistics partner is chosen. See lib/delivery.ts.
alter table orders
  add column if not exists shipping_address jsonb,
  add column if not exists delivery_fee numeric(12, 2) not null default 0,
  add column if not exists delivery_status text not null default 'to_be_quoted'
    check (delivery_status in ('quoted', 'to_be_quoted')),
  add column if not exists newsletter_opt_in boolean not null default false,
  add column if not exists newsletter_opt_in_at timestamptz;

-- Delivery rates: per-state flat fee, set as store policy (not a courier
-- quote). Seeded inactive with a zero fee until real rates are chosen —
-- see lib/delivery.ts for what an inactive rate means at checkout.
create table if not exists delivery_rates (
  state      text primary key,
  fee        numeric(12, 2) not null default 0,
  active     boolean not null default false,
  updated_at timestamptz not null default now()
);

-- RLS: service role only. No public policy — rates are looked up
-- server-side during checkout, never read directly by the browser.
alter table delivery_rates enable row level security;

insert into delivery_rates (state) values
  ('Abia'), ('Adamawa'), ('Akwa Ibom'), ('Anambra'), ('Bauchi'),
  ('Bayelsa'), ('Benue'), ('Borno'), ('Cross River'), ('Delta'),
  ('Ebonyi'), ('Edo'), ('Ekiti'), ('Enugu'), ('FCT (Abuja)'),
  ('Gombe'), ('Imo'), ('Jigawa'), ('Kaduna'), ('Kano'),
  ('Katsina'), ('Kebbi'), ('Kogi'), ('Kwara'), ('Lagos'),
  ('Nasarawa'), ('Niger'), ('Ogun'), ('Ondo'), ('Osun'),
  ('Oyo'), ('Plateau'), ('Rivers'), ('Sokoto'), ('Taraba'),
  ('Yobe'), ('Zamfara')
on conflict (state) do nothing;

-- ============================================================
-- Cleanup 4.4: structured order line items
-- ============================================================
-- The checkout API now writes the full order row itself at 'pending'
-- (structured items, address, delivery info) before Paystack ever sees
-- the reference; the webhook only flips status to 'paid'. A row that
-- exists but was never finished by the webhook should read as
-- incomplete by default, not as a successful sale — 'paid' was the
-- wrong default for that.
alter table orders alter column status set default 'pending';

-- ============================================================
-- Phase 2.1: catalogue schema for a real (Prokip) import
-- ============================================================
-- sku ties a row to its Prokip record so a re-import can upsert instead
-- of duplicating (2.4). A plain unique constraint is fine on a nullable
-- column — Postgres allows any number of NULLs, so hand-added admin
-- products without a Prokip SKU are unaffected.
--
-- stock_quantity replaces the flattened in_stock boolean as the real
-- inventory signal once 2.4 (import) and 4.5 (decrement on payment)
-- exist to maintain it. in_stock stays a plain, independently-settable
-- column for now rather than becoming `generated always as
-- (stock_quantity > 0)` — doing that today, before anything populates
-- stock_quantity, would silently flip every existing product to "out of
-- stock" (default 0) and break the admin "In stock" checkbox, which
-- writes to in_stock directly. 2.4 and 4.5 are expected to set both
-- columns together when they actually manage real stock counts.
alter table products
  add column if not exists sku text unique,
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists published boolean not null default false;

create index if not exists products_published_idx on products (published);

-- Existing products predate `published` and are already live — without
-- this backfill, every one of them would vanish from the storefront the
-- moment 2.2 starts filtering by published = true. New rows (including
-- future Prokip imports) still default to false.
update products set published = true where published = false;

-- ============================================================
-- Phase 4.5: atomic stock decrement on payment
-- ============================================================
-- A plain read-then-write from the webhook (SELECT stock_quantity, then
-- UPDATE with the computed value) has a race: two webhooks for the same
-- product's last unit can both read "1 in stock" before either writes
-- back 0, and both sales go through. This function does the decrement
-- and the floor-at-zero in one UPDATE, computed from the row's current
-- value at write time — Postgres's row lock during the UPDATE makes it
-- atomic against a concurrent call for the same product, which a
-- supabase-js .update({stock_quantity: someJsNumber}) can't be, since
-- that always sends a literal value, never a SQL expression.
create or replace function decrement_product_stock(p_id uuid, qty integer)
returns void
language sql
as $$
  update products
  set stock_quantity = greatest(stock_quantity - qty, 0),
      in_stock = greatest(stock_quantity - qty, 0) > 0
  where id = p_id;
$$;
