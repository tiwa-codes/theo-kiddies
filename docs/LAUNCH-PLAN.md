# Theo Kiddies — Launch Plan

> **For a Claude Code session running locally in this repo.**
> Start with: *"Read docs/LAUNCH-PLAN.md and work through Phase 0, then Phase 1. Follow the ground rules."*

---

## Ground rules

1. **Work one task at a time.** Complete it, verify it, report what changed, then move on. Do not batch five tasks into one diff.
2. **Test first where the task says so.** Write the failing test, make it pass, then clean up. Money logic and parsers are non-negotiable — they get tests.
3. **Verify before claiming done.** Every task has a "Verify" line. Run it. `npm run build` must pass before any task is called complete. Never say "that should work."
4. **Do not make the decisions in "Open decisions" below.** If a task needs one, stop and ask Tiwalola. Guessing is worse than waiting.
5. **Do not touch anything not named in the task.** No opportunistic refactors, no reformatting, no dependency upgrades.
6. **Commit per task**, with a message that says what changed and why. Not "Refactor code structure for improved readability and maintainability."
7. **YAGNI.** Build what the task says. Not the general case, not the future case.

---

## Current state

Next 14 (App Router) · Supabase · Clerk (admin only) · Paystack · Resend · Zustand.
Full audit: `docs/AUDIT.md` and https://claude.ai/code/artifact/eae1d557-e460-4152-a192-b429ed5e6f3c

### Already done (do not redo) — uncommitted in the working tree

- **Blocker 01 — server-side pricing.** `lib/checkout.ts` (`parseRequestedItems`, `priceOrder`) prices from the catalogue; `app/api/checkout/route.ts` rewritten; `app/checkout/page.tsx` sends only `{slug, quantity, color, size}`.
- **Blocker 02 — admin API auth.** `middleware.ts` now matches `/api/admin(.*)`; all five `/api/admin/*` routes call `requireAdmin()`.
- **Blocker 03 — admin role gate.** `lib/admin-auth.ts` with an `ADMIN_USER_IDS` allowlist. Fails closed.

**Operational note:** `/admin` now locks everyone out until `ADMIN_USER_IDS` is set in `.env` and in Vercel. Find the Clerk user ID at Clerk dashboard → Users → your account.

Tests for the above exist at `lib/__tests__/` but **have never been executed** — vitest could not be installed in the environment they were written in. `next build` was likewise never completed there. Phase 0 fixes both.

### Not started

Blocker 04 (delivery + address capture), the Prokip catalogue import, campaign machinery, and the cleanup list.

---

## Locked decisions

Do not revisit these. They came from Tiwalola directly.

| Decision | Value |
|---|---|
| Store location | **Abuja (FCT)** — not Lagos |
| Delivery pricing | **Per-state flat rate**, set as store policy, not passed through from a courier |
| Rates known? | **No** — no logistics partner chosen yet. Build the structure, leave rates inactive |
| Free delivery threshold | **₦150,000** — the banner currently says ₦15,000, which is wrong by a factor of ten |
| Checkout | **Guest checkout.** No account required to buy |
| Customer accounts | **Not in scope.** Replace with order lookup by reference + email |
| Newsletter opt-in | **Unchecked by default**, consent stored with a timestamp |
| Marketing email | Separate Resend audience from transactional — never the same list |

### Checkout fields (agreed)

Required: full name (one field), email, phone (NG mobile, validated), state (dropdown, 37 entries), city/town, street address.
Optional: alternative phone, nearest landmark, delivery notes, newsletter opt-in.
**Dropped:** ZIP / postal code. Nigeria has postcodes; nobody uses them for delivery.

---

## Open decisions — STOP and ask

- The actual per-state delivery rates (blocked on choosing a logistics company).
- What to do about the invented testimonials in `lib/data.ts` — remove, or replace with real ones.
- Which products to merchandise first after the catalogue import.
- Whether to reintroduce a free-delivery *promotion* separate from the ₦150,000 rule.
- Best Sellers nav link — compute from order history, or remove until there is data.
- Currency selector — label as approximate, or remove.
- Analytics provider.

---

# Phase 0 — Housekeeping

### 0.1 Install the test runner and run the existing suite
- **Files:** `package.json` (already has `test` / `test:watch` scripts and `vitest.config.ts`)
- **Do:** `npm i -D vitest`, then `npm test`.
- **Verify:** `lib/__tests__/checkout.test.ts` and `lib/__tests__/admin-auth.test.ts` both pass. If anything fails, fix the source, not the test — the tests encode the security properties.

### 0.2 Clean up scratch files
- **Do:** delete the `_to_delete/` folder in the repo root (stale git lock files and scratch scripts). `.DS_Store` files are gitignored but were committed earlier — `git rm --cached` them.
- **Verify:** `git status` clean, `_to_delete/` gone.

### 0.3 Fix the delivery banner — do this first, it is live and wrong
- **Files:** `lib/data.ts` (the `announcement` export)
- **Do:** change `₦15,000` to `₦150,000`.
- **Verify:** load the homepage, read the bar.

### 0.4 Confirm the build is green
- **Do:** `npm run build`.
- **Verify:** exits 0. Everything after this assumes a green baseline.

---

# Phase 1 — Blocker 04: delivery and address capture

**Why this is a blocker:** the address fields on the checkout page are uncontrolled inputs bound to no state, sent to no API, stored in no column. Every paid order today arrives as an email address and nothing else. The page also tells customers "Shipping — Calculated by Paystack", which Paystack does not do.

### 1.1 Schema
- **Files:** `supabase/schema.sql`
- **Do:** add
  - `delivery_rates` — `state text primary key`, `fee numeric(12,2) not null default 0`, `active boolean not null default false`, `updated_at timestamptz default now()`. RLS on, no public policy (service-role reads only).
  - On `orders`: `shipping_address jsonb`, `delivery_fee numeric(12,2) not null default 0`, `delivery_status text not null default 'to_be_quoted'` (`'quoted' | 'to_be_quoted'`), `newsletter_opt_in boolean not null default false`, `newsletter_opt_in_at timestamptz`.
  - Seed all 37 rows (36 states + FCT) into `delivery_rates` with `fee = 0, active = false`.
- **Verify:** run the SQL in Supabase; `select count(*) from delivery_rates` returns 37.

### 1.2 Nigerian states as a shared constant
- **Files:** new `lib/nigeria.ts`
- **Do:** export `NIGERIAN_STATES` — a frozen array of the 36 states plus `"FCT (Abuja)"`, exactly matching the seeded primary keys. Export `isValidNigerianPhone(value: string)` — accepts `0803…`, `+234803…`, `234803…`, normalises to `+234…`.
- **Test first:** phone validation. Valid: `08031234567`, `+2348031234567`, `2348031234567`, `0703…`, `0901…`. Invalid: too short, too long, non-numeric, a UK number.
- **Verify:** `npm test` green.

### 1.3 Delivery fee calculation (pure, tested)
- **Files:** new `lib/delivery.ts`
- **Do:** export `calculateDeliveryFee({ state, subtotalNaira, rates })` returning `{ fee: number; status: 'quoted' | 'to_be_quoted'; message: string }`.
  - Subtotal **≥ ₦150,000** → `fee: 0`, `status: 'quoted'`, message says free delivery applied.
  - State has an **active** rate → that fee, `status: 'quoted'`.
  - State has **no active** rate → `fee: 0`, `status: 'to_be_quoted'`, message: *"Delivery to {state} will be confirmed on WhatsApp before dispatch."*
  - Unknown state → throw. The dropdown makes this unreachable; treat it reaching the server as tampering.
- **Test first.** Cover: threshold exactly at ₦150,000 (inclusive), ₦149,999.99 (not free), active rate applied, inactive rate → to_be_quoted, free-delivery beats an active rate, unknown state throws.
- **Verify:** `npm test` green.

### 1.4 Shipping address validation (pure, tested)
- **Files:** `lib/checkout.ts` — add `parseShippingAddress(raw: unknown)`
- **Do:** validate and narrow to the agreed field list. Required: `fullName`, `email`, `phone` (via `isValidNigerianPhone`), `state` (must be in `NIGERIAN_STATES`), `city`, `street`. Optional: `altPhone`, `landmark`, `notes`, `newsletterOptIn` (boolean, defaults false). Trim everything; cap each string at a sane length. Throw `InvalidCartError` with a message the customer can act on.
- **Test first.** Include: a missing state is rejected; a UK phone is rejected; `newsletterOptIn` defaults to `false` when absent (never true).
- **Verify:** `npm test` green.

### 1.5 Wire the checkout API
- **Files:** `app/api/checkout/route.ts`
- **Do:** parse the address, load active rates from Supabase, call `calculateDeliveryFee`, add the fee to `amountKobo`. Pass `shipping_address`, `delivery_fee` and `delivery_status` through Paystack `metadata` under a single key — **not** as `custom_fields`, which has a size ceiling. Return the fee and its message to the client so the summary can show it before payment.
- **Verify:** POST a cart with a state that has an active rate and one that doesn't; confirm the Paystack amount differs correctly in both cases.

### 1.6 Persist it on the webhook
- **Files:** `app/api/webhooks/paystack/route.ts`
- **Do:** write `shipping_address`, `delivery_fee`, `delivery_status`, `newsletter_opt_in` and `newsletter_opt_in_at` onto the order row. Add the delivery address and fee to the Resend confirmation email — the customer needs to see where it's going.
- **Verify:** replay a `charge.success` payload; confirm the row and the email both carry the address.

### 1.7 Rebuild the checkout form
- **Files:** `app/checkout/page.tsx`
- **Do:** make every field controlled and validated. State as a `<select>` from `NIGERIAN_STATES`. Drop the ZIP field. Add the newsletter checkbox, **unchecked**, with a plain-language label. Replace *"Shipping — Calculated by Paystack"* with the live fee, or the to-be-quoted message. Show the delivery total in the summary before the pay button. Use `formatPrice` from `lib/currency.ts` rather than hardcoded `₦` — the rest of the site respects the currency store and this page does not.
- **Verify:** submit with each field missing in turn and confirm a useful error; complete a real test purchase against Paystack test keys.

### 1.8 Admin: delivery rates screen
- **Files:** new `app/admin/delivery/page.tsx`, new `app/api/admin/delivery-rates/route.ts`, add to the nav in `app/admin/layout.tsx`
- **Do:** table of all 37 states, editable fee, active toggle per row. `requireAdmin()` on the API — follow the pattern in `app/api/admin/products/route.ts` exactly.
- **Verify:** set FCT to a fee and activate it; confirm checkout to Abuja charges it and checkout to Kano still says to-be-quoted.

### 1.9 Admin: surface orders needing a quote
- **Files:** `app/admin/orders/page.tsx`
- **Do:** show the shipping address per order, and a clear badge on `to_be_quoted` orders. These need a human to call the customer — they must not be easy to miss.
- **Verify:** an order with each status renders distinguishably.

---

# Phase 2 — Catalogue: the Prokip import

**Context:** an importer already existed. Commit `707d6cb` added `lib/prokipImport.ts` and `app/api/admin/products/import/route.ts`; commit `175b277` deleted both. Recover them with `git checkout 707d6cb -- lib/prokipImport.ts app/api/admin/products/import/route.ts` and then fix the three flaws below. Do **not** rewrite from scratch.

Its known flaws: it inserts rather than upserts (re-running duplicates the catalogue); there is no SKU, so nothing ties a row to its Prokip record; and category/age group were applied per-file, forcing one CSV per category.

### 2.1 Schema for a real catalogue
- **Files:** `supabase/schema.sql`
- **Do:** add to `products`: `sku text unique`, `stock_quantity integer not null default 0`, `published boolean not null default false`. Keep `in_stock` working — derive it from `stock_quantity > 0` so nothing on the storefront breaks. Index `sku` and `published`.
- **Verify:** existing products still render on the storefront.

### 2.2 Only show published products
- **Files:** `lib/products.ts`, `app/admin/products/page.tsx`
- **Do:** storefront queries filter `published = true`; admin shows everything with a published toggle.
- **Verify:** an unpublished product 404s on the storefront and is visible in admin.

### 2.3 Query-level filtering and pagination — **do this before importing**
- **Files:** `lib/products.ts`, `app/category/[slug]/page.tsx`
- **Do:** `getAllProducts()` currently does `select("*")` and the category page filters the whole array in memory. Push category, age group, price band, stock and sort into the Supabase query. Add `.range()` pagination and a pager on the grid.
- **Why it cannot wait:** Supabase caps rows at 1000 by default. Import a POS catalogue without this and product 1001 silently never appears anywhere, with no error.
- **Verify:** seed 1,200 rows in a scratch table and confirm every one is reachable through the UI.

### 2.4 Restore and fix the importer — **needs a real Prokip export, ask for one**
- **Files:** `lib/prokipImport.ts`, `app/api/admin/products/import/route.ts`
- **Do:** recover both from `707d6cb`. Then: parse the SKU column and carry it through; change `insert` to `upsert` on `sku`; map the Prokip stock count into `stock_quantity` rather than flattening to a boolean; set `published = false` on insert and **never** modify `published`, `images`, `description`, `category` or `age_group` on update — a re-import refreshes price and stock only.
- **Do not guess the column layout.** The old parser assumed title at index 3, price at 6, stock at 7. That was inferred, not verified. Ask Tiwalola for a real export before writing the parser — a silent column shift produces a catalogue with wrong prices, which is the worst failure available here.
- **Test first.** Cover: header row found; price strings with `₦` and commas parsed; a row with no SKU skipped and reported; running the same file twice produces no duplicates and no overwritten photos.
- **Verify:** import a file twice; row count identical, photos intact.

### 2.5 Import report
- **Files:** `app/admin/products/page.tsx`
- **Do:** after an import, show created / updated / skipped counts and the skipped rows with reasons. A silent import that dropped 200 rows is worse than a failed one.
- **Verify:** import a file with deliberately broken rows; confirm they are listed.

---

# Phase 3 — Back-to-school campaign

**Context:** there is no discount engine. The only sale mechanism is per-product `compare_at_price`, and `/category/deals` lists anything with one set. Campaign copy is hardcoded in JSX, so running a sale currently needs a redeploy.

### 3.1 Bulk discount action
- **Files:** `app/admin/products/page.tsx`, new `app/api/admin/products/bulk-discount/route.ts`
- **Do:** multi-select products → apply *X% off* → writes `compare_at_price` (the original) and the discounted `price`, plus a badge. A second action reverses it.
- **Test first:** the percentage maths, including rounding to whole naira and refusing to discount an already-discounted product twice.
- **Verify:** apply 20% to three products, check the storefront, reverse it, check the prices returned exactly.

### 3.2 Editable campaign copy
- **Files:** `lib/site-content.ts`, `components/layout/AnnouncementBar.tsx`, `components/sections/PromoBanner.tsx`, `app/admin/settings/page.tsx`
- **Do:** move the announcement string and the promo banner heading, body and CTA into the existing `site_content` key/value table. The plumbing already exists — the hero image uses it. Add an admin form.
- **Verify:** change the banner text in admin, reload the homepage, no deploy.

### 3.3 Campaign collections
- **Files:** `supabase/schema.sql`, `app/category/[slug]/page.tsx`, `lib/data.ts`
- **Do:** the category page validates slugs against a hardcoded `categoryMap`, so every campaign URL needs a code change. Add a `collections text[]` column on `products` and resolve unknown slugs against it before 404ing. Add `back-to-school` to the nav.
- **Verify:** tag five products `back-to-school`; `/category/back-to-school` lists exactly those.

### 3.4 Fix the empty nav pages
- **Files:** `app/category/[slug]/page.tsx`
- **Do:** *New Arrivals* filters on `badge === "New"` and *Best Sellers* on `badge === "Best Seller"`. A bulk import sets no badge, so both land on empty pages. Drive New Arrivals off `created_at` instead. For Best Sellers, either compute from order history or remove the nav link until there is data — **ask before choosing**.
- **Verify:** both pages return products after an import.

---

# Phase 4 — Cleanup

Roughly in order of cost to the business.

### 4.1 The WhatsApp number is a US placeholder
- **Files:** `components/shop/AddToCartButton.tsx`
- **Do:** it hardcodes `wa.me/15551234567`. Use `siteConfig.whatsapp`, which already exists and is ignored. Check the value in `.env` is the real store number.
- **Verify:** click through to WhatsApp on a product page.

### 4.2 Delete the mockup account pages
- **Files:** `app/account/login/page.tsx`, `app/account/register/page.tsx`
- **Do:** these are non-functional forms that display *"Connect an auth provider (NextAuth, Clerk, Supabase) to enable real authentication"* to customers. Delete both and redirect the routes. Customer accounts are out of scope — guest checkout is the decision.
- **Verify:** the routes redirect; nothing links to them.

### 4.3 Order lookup by reference
- **Files:** new `app/orders/lookup/page.tsx`, new `app/api/orders/lookup/route.ts`
- **Do:** reference + email returns the order status and contents. This is what replaces customer accounts. Rate-limit it, and only match when **both** values are correct.
- **Test first:** a correct reference with the wrong email must return nothing.
- **Verify:** look up a real test order; confirm a mismatched email reveals nothing.

### 4.4 Structured order line items
- **Files:** `app/api/checkout/route.ts`, `app/api/webhooks/paystack/route.ts`, `supabase/schema.sql`
- **Do:** orders currently store whatever Paystack echoes back in `metadata.custom_fields` — display strings like `"Qty 2 · ₦9,000"`. No numeric quantity, no product ID, nothing reportable, and a metadata size ceiling a large cart can breach. Write the order row yourself at checkout time with `status: 'pending'` and structured line items; the webhook flips it to `paid`. Paystack's metadata should carry a reference, not your data.
- **Verify:** a paid order has structured line items with numeric quantities and product IDs.

### 4.5 Decrement stock on payment
- **Files:** `app/api/webhooks/paystack/route.ts`
- **Do:** decrement `stock_quantity` per line item. Depends on 2.1 and 4.4. The weekly Prokip re-import corrects any drift, so this does not need to be perfect — it needs to stop two people buying the last uniform.
- **Verify:** buy the last unit; the product shows out of stock.

### 4.6 Require an explicit size and colour
- **Files:** `components/shop/AddToCartButton.tsx`, `store/cart.ts`
- **Do:** it preselects the first variant, so a parent can buy a school shirt having never looked at the size selector. Require an explicit choice when variants exist. Also store variant **labels** alongside ids — the cart, order summary and confirmation email currently show `coral` instead of `Warm Coral`.
- **Verify:** add-to-cart is disabled until a size is chosen; the email shows readable labels.

### 4.7 Real search
- **Files:** new `app/search/page.tsx`, `components/layout/Header.tsx`
- **Do:** the header submits to `/category/clothing?q=…`, so searching "backpack" searches only Clothing and finds nothing. Add a real search route querying title, description and category across the table.
- **Verify:** "backpack" returns School Supplies results.

### 4.8 Fabricated social proof — **ask first**
- **Files:** `lib/data.ts`, `components/sections/Testimonials.tsx`, `app/admin/products/page.tsx`
- **Do:** the testimonials are invented named customers with locations, and the admin form defaults every product to `rating: 5.0`. Both are fabricated social proof on a commercial site. Default new products to no rating. For the testimonials section, **ask Tiwalola** whether to remove it or replace it with real reviews.

### 4.9 Currency honesty — **ask first**
- **Files:** `lib/currency.ts`, `components/layout/CurrencySelector.tsx`
- **Do:** conversion uses hardcoded rates (1 USD = ₦1,650) that drift, while checkout always charges naira. Either label the selector *"approximate — you'll be charged in ₦"*, or remove it.

### 4.10 Security tidy-ups
- **Files:** `app/api/webhooks/paystack/route.ts`, `lib/supabase.ts`, `lib/products.ts`
- **Do:** compare the webhook signature with `crypto.timingSafeEqual`, not `!==`. Use the Supabase **anon** key for public storefront reads — they currently go through the service-role key, which bypasses the RLS policies already written in `schema.sql`.
- **Verify:** the webhook still accepts a genuine payload and rejects a forged one; the storefront still renders.

### 4.11 Analytics — **ask first**
- **Files:** `app/layout.tsx`
- **Do:** add analytics with a checkout funnel. Ask which provider before adding a script.

---

## Done means

**Before any real payment:** blockers 01–04 closed · a real end-to-end test purchase on live Paystack keys · a refund path decided, even if manual · `npm run build` green · `npm test` green.

**Before the catalogue import:** `sku` / `stock_quantity` / `published` in place · importer upserting on SKU · pagination pushed into the query · a test run against a real Prokip export.

**Before the back-to-school push:** bulk discount action · banner copy editable without a deploy · a campaign landing page that does not 404 · the WhatsApp number fixed · the fake testimonials resolved.
