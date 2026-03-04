/**
 * Fetch products from Supabase when configured,
 * otherwise fall back to the static seed data in lib/data.ts.
 */
import { products as staticProducts } from "@/lib/data";
import { supabase, dbProductToProduct, type DbProduct } from "@/lib/supabase";
import type { Product } from "@/types";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return staticProducts;
    return (data as DbProduct[]).map(dbProductToProduct);
  } catch {
    // DB not configured yet — use static seed data
    return staticProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // Fall back to static seed
      return staticProducts.find((p) => p.slug === slug) ?? null;
    }
    return dbProductToProduct(data as DbProduct);
  } catch {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
}
