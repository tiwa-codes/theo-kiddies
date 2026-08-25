/**
 * Fetch products from Supabase when configured,
 * otherwise fall back to the static seed data in lib/data.ts.
 */
import { products as staticProducts } from "@/lib/data";
import { supabase, dbProductToProduct, type DbProduct } from "@/lib/supabase";
import type { Product } from "@/types";

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getAllProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig()) return staticProducts;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];
    return (data as DbProduct[]).map(dbProductToProduct);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseConfig()) {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return dbProductToProduct(data as DbProduct);
  } catch {
    return null;
  }
}

/**
 * Fetch just the products a cart refers to. Used by the checkout API so that
 * prices are always read from the catalogue, never from the request body.
 * Errors propagate on purpose: an empty result must mean "not in the catalogue",
 * not "the database call failed".
 */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const unique = Array.from(new Set(slugs));
  if (unique.length === 0) return [];

  if (!hasSupabaseConfig()) {
    return staticProducts.filter((p) => unique.includes(p.slug));
  }

  const { data, error } = await supabase.from("products").select("*").in("slug", unique);
  if (error) throw error;

  return ((data ?? []) as DbProduct[]).map(dbProductToProduct);
}
