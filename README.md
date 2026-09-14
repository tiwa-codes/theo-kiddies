# Theo Kiddies — Ecommerce Storefront

An ecommerce web app for **Theo Kiddies**, a kids essentials store offering products like **clothing, shoes, toys, school supplies, baby essentials, and accessories**.

Built with **Next.js (App Router) + TypeScript** and deployed on Vercel.

- Live site: https://theo-kiddies.vercel.app

## Features (high level)
- **Product browsing** by category (e.g. clothing, shoes, toys, etc.)
- **Product detail** pages
- **Checkout flow** and **order confirmation**
- **Customer account** pages
- **Admin area** (`/admin/*`) protected behind authentication

## Tech stack
- **Next.js** / **React** / **TypeScript**
- **Tailwind CSS** + PostCSS (styling)
- **Clerk** (authentication)
- **Supabase** (backend/data/services)
- **Resend** (transactional email)
- **Zustand** (client state)

## Project structure
- `app/` — routes (pages + API route handlers)
  - `app/admin/*` — admin area (protected by middleware)
  - `app/api/*` — API routes (Next.js route handlers)
  - `app/category/*`, `app/product/*`, `app/checkout/*`, `app/order-confirmation/*` — storefront flows
- `components/` — UI components and page sections
- `lib/` — shared utilities and data/content helpers
- `store/` — Zustand stores
- `supabase/` — Supabase configuration/migrations
- `public/` — static assets
- `types/` — shared TypeScript types

## Getting started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Copy the example file and fill in values:
```bash
cp .env.local.example .env.local
```

Common env vars:
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Supabase keys/URLs (see `.env.local.example`)
- Resend API key (if using email)

### 3) Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint

## Auth / Admin protection
Admin routes are protected via `middleware.ts` using Clerk:
- Any route matching `/admin/*` requires a signed-in session.

## Deployment
Designed for deployment on **Vercel**.

## License
No license file is currently included in this repository.
