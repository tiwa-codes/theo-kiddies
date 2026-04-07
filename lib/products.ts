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
