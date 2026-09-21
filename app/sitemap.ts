import type { MetadataRoute } from "next";
import { AGE_BANDS, AGE_GROUPS, ageGroupSlug } from "@/lib/ageGroups";
import { getAllProducts } from "@/lib/products";

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
] as const;

const ageRoutes = [...AGE_BANDS.map((band) => band.slug), ...AGE_GROUPS.map(ageGroupSlug)].map(
  (slug) => ({ url: `/category/${slug}`, priority: 0.7, changeFrequency: "weekly" as const })
);

// Rendered per request so newly added products appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [...staticRoutes, ...ageRoutes].map((r) => ({
    url: `${base}${r.url}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...staticEntries, ...productEntries];
}
