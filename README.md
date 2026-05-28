# Theo Kiddies Storefront

Next.js (App Router) + TypeScript ecommerce storefront for **Theo Kiddies**.

- Live site: https://theo-kiddies.vercel.app
- Framework: Next.js 14 (App Router)
- Auth: Clerk
- Backend/services: Supabase
- Email: Resend
- Styling: Tailwind CSS
- State: Zustand

## Tech stack
- **Next.js** / **React** / **TypeScript**
- **Tailwind CSS** + PostCSS
- **Clerk** for authentication
- **Supabase** for data/services
- **Resend** for transactional email

## Project structure
High-level directory layout:

- `app/` — App Router routes (pages + API routes)
  - `app/admin/*` — admin area (protected by middleware)
  - `app/api/*` — route handlers (serverless endpoints)
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

You will typically need (depending on features you use):
- `NEXT_PUBLIC_URL` (used for metadata base URL)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (to enable Clerk provider)
- Supabase keys/URLs (see `.env.local.example`)
- Resend API key (if using email features)

### 3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts
- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint

## Auth / Admin protection
Admin routes are protected via `middleware.ts` using Clerk:
- Any route matching `/admin/*` requires a signed-in session.

## Deployment
This project is suitable for deployment on Vercel.

## License
No license file is currently included in this repository.
