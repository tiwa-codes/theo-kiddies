import { siteConfig } from "@/lib/config";

/** The accounts printed on the thank-you card, in the same order. */
export const SOCIAL_HANDLE = "@theokiddies";

export const socialLinks = [
  { name: "Instagram", href: siteConfig.instagram },
  { name: "Facebook", href: siteConfig.facebook },
  { name: "TikTok", href: siteConfig.tiktok },
] as const;

export type SocialName = (typeof socialLinks)[number]["name"];
