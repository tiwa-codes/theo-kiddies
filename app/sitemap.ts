import type { MetadataRoute } from "next";
import { products } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_URL ?? "https://theokiddies.com";

const staticRoutes = [
  { url: "/", priority: 1.0, changeFrequency: "daily" },
  { url: "/category/clothing", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/shoes", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/toys", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/school-supplies", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/baby-essentials", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/accessories", priority: 0.9, changeFrequency: "weekly" },
  { url: "/category/new-arrivals", priority: 0.8, changeFrequency: "daily" },
  { url: "/category/best-sellers", priority: 0.8, changeFrequency: "daily" },
  { url: "/category/deals", priority: 0.8, changeFrequency: "daily" },
  { url: "/category/0-12-months", priority: 0.7, changeFrequency: "weekly" },
  { url: "/category/1-3-years", priority: 0.7, changeFrequency: "weekly" },
  { url: "/category/4-7-years", priority: 0.7, changeFrequency: "weekly" },
  { url: "/category/8-12-years", priority: 0.7, changeFrequency: "weekly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.url}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...staticEntries, ...productEntries];
}
