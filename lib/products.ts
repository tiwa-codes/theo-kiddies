/**
 * Fetch products from Supabase when configured,
 * otherwise fall back to the static seed data in lib/data.ts.
 *
 * Uses the anon-key client, not the service-role one — these are public
 * storefront reads, and the "Public can read products" RLS policy in
 * schema.sql is what should be authorising them, the same as it would for
 * a request straight from the browser. None of this needs to bypass RLS.
 */
import { products as staticProducts } from "@/lib/data";
import { supabasePublic, dbProductToProduct, escapeLikePattern, type DbProduct } from "@/lib/supabase";
import type { Product } from "@/types";

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getAllProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig()) return staticProducts;

  try {
    const { data, error } = await supabasePublic
      .from("products")
      .select("*")
      .eq("published", true)
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
    const { data, error } = await supabasePublic
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
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
 *
 * Deliberately not filtered by published — an item already sitting in
 * someone's cart from before it was unpublished is a separate business
 * question (block the sale? let it complete?) that 2.2 doesn't answer.
 */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const unique = Array.from(new Set(slugs));
  if (unique.length === 0) return [];

  if (!hasSupabaseConfig()) {
    return staticProducts.filter((p) => unique.includes(p.slug));
  }

  const { data, error } = await supabasePublic.from("products").select("*").in("slug", unique);
  if (error) throw error;

  return ((data ?? []) as DbProduct[]).map(dbProductToProduct);
}

/**
 * Real search across title, description and category — not scoped to a
 * single category page. Three separate .ilike() calls merged in JS rather
 * than one hand-built .or() filter string: PostgREST's or() syntax treats
 * commas and parentheses as structural, so a search term containing them
 * would either break the query or need its own escaping on top of
 * escapeLikePattern's.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!hasSupabaseConfig()) {
    const q = trimmed.toLowerCase();
    return staticProducts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  const pattern = `%${escapeLikePattern(trimmed)}%`;
  const [byTitle, byDescription, byCategory] = await Promise.all([
    supabasePublic.from("products").select("*").eq("published", true).ilike("title", pattern),
    supabasePublic.from("products").select("*").eq("published", true).ilike("description", pattern),
    supabasePublic.from("products").select("*").eq("published", true).ilike("category", pattern),
  ]);

  for (const result of [byTitle, byDescription, byCategory]) {
    if (result.error) throw result.error;
  }

  const byId = new Map<string, DbProduct>();
  for (const result of [byTitle, byDescription, byCategory]) {
    for (const row of (result.data ?? []) as DbProduct[]) {
      byId.set(row.id, row);
    }
  }

  return Array.from(byId.values()).map(dbProductToProduct);
}
