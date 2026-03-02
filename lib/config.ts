/**
 * Store-wide configuration.
 * Edit the values here (or set env vars on Vercel) to update contact info
 * and social links across the entire site in one place.
 */

export const siteConfig = {
  name: "Theo Kiddies",
  url: process.env.NEXT_PUBLIC_URL ?? "https://theokiddies.com",
  tagline: "Curated picks for busy parents: cozy clothing, playful toys, and everyday essentials.",
  description:
    "Theo Kiddies is a nationwide children's retail store for clothing, shoes, toys, school supplies, baby essentials, and accessories.",

  // ── Contact ──────────────────────────────────────────────────────────────
  // Set these in Vercel environment variables or edit directly below
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "+234 800 000 0000",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "hello@theokiddies.com",
  hours: "Mon–Sat: 9am – 6pm",

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  // International format without +/spaces e.g. 2348012345678
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000",

  // ── Social ───────────────────────────────────────────────────────────────
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/theokiddies",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/theokiddies",
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL ?? "https://twitter.com/theokiddies",
};
