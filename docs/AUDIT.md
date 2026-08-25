# Theo Kiddies — Launch Audit

Reviewed 25 Aug 2026 at commit `ab1f447`. `tsc --noEmit` clean across 88 files.
Formatted version: https://claude.ai/code/artifact/eae1d557-e460-4152-a192-b429ed5e6f3c
Executable task list: `docs/LAUNCH-PLAN.md`

Stack: Next 14 App Router · Supabase · Clerk · Paystack · Resend · Zustand.

## Launch blockers

Blockers 01–03 are **fixed** (see LAUNCH-PLAN "Already done"). Kept here for the record.

1. **Client-controlled prices.** `app/api/checkout/route.ts` summed the `items` array posted from the browser; the cart is localStorage. Anyone could pay ₦1 for anything. → Fixed: `lib/checkout.ts` prices from the catalogue.
2. **Admin write API unauthenticated.** `middleware.ts` matched `/admin(.*)` but not `/api/admin/…`, so `POST /api/admin/products` and `PUT|DELETE /api/admin/products/[id]` ran with the service-role key and checked nothing. → Fixed: matcher extended, `requireAdmin()` in every handler.
3. **Any signed-up user was an admin.** `auth.protect()` only checked signed-in and `/sign-up` is public. → Fixed: `ADMIN_USER_IDS` allowlist in `lib/admin-auth.ts`, fails closed.
4. **Orders are unfulfillable.** *Still open.* Address fields on `app/checkout/page.tsx` are uncontrolled, never sent, never stored; `orders` has no address column. Only the email reaches the store. "Shipping — Calculated by Paystack" is false and no delivery fee is charged. → Phase 1.

## Scale problem

`getAllProducts()` does `select("*")` and `app/category/[slug]/page.tsx` filters in memory. Supabase caps at 1000 rows — with a POS catalogue, product 1001 silently never appears, with no error. Must be fixed before the import.

## Prokip catalogue import

An importer existed: commit `707d6cb` added `lib/prokipImport.ts` + `app/api/admin/products/import/route.ts`; commit `175b277` deleted both. Recoverable via `git checkout 707d6cb -- <paths>`.

Flaws to fix before reuse: insert-only (re-run duplicates), no SKU key, category/age applied per-file. Add `sku` / `stock_quantity` / `published` columns **before** importing — retrofitting a key onto 800 rows later is far worse.

## Back-to-school gaps

- No discount engine. Only per-product `compare_at_price`; `/category/deals` lists anything with one set.
- Campaign copy hardcoded in `components/sections/PromoBanner.tsx` and `lib/data.ts` → sale changes need a redeploy. The `site_content` k/v table already exists (hero image uses it).
- `categoryMap` is a hardcoded whitelist → `/category/back-to-school` 404s.
- New Arrivals filters `badge === "New"`, Best Sellers `badge === "Best Seller"` — a bulk import sets no badge, so both nav links land on empty pages.

## Should-fix

- WhatsApp enquiry link hardcoded to `wa.me/15551234567` (US placeholder) in `components/shop/AddToCartButton.tsx`; `siteConfig.whatsapp` unused.
- `/account/login` + `/account/register` are live mockups showing "Connect an auth provider…" to customers. Clerk already serves `/sign-in`, `/sign-up`.
- Testimonials in `lib/data.ts` are invented named customers; admin defaults every product to `rating: 5.0`. Fabricated social proof.
- Currency switcher uses hardcoded FX rates (`lib/currency.ts`) but checkout charges raw NGN; the checkout page ignores the currency store entirely.
- Order line items stored as Paystack `custom_fields` display strings — no numeric qty, no product id, metadata size ceiling risk.
- No stock decrement on paid order.
- `AddToCartButton` preselects first colour/size → wrong-size orders. Cart stores variant ids, not labels.
- Header search submits to `/category/clothing?q=` — searches only Clothing.
- Webhook signature compared with `!==`; use `crypto.timingSafeEqual`. Storefront public reads use the service-role key, bypassing RLS.
- No test runner was configured; `vitest.config.ts` and `lib/__tests__/` were added but never executed.

## What is solid

Clean TypeScript throughout; sensible, navigable structure; webhook-driven order capture with signature verification and an idempotent upsert on `reference`; Resend confirmation email; admin multi-image upload to Supabase Storage with drag-reorder; SEO basics (sitemap, robots, product structured data, per-category metadata, OpenGraph); responsive from phone to desktop.
