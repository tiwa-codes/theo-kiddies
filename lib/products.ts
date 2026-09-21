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

const PRICE_BANDS: Record<string, { min?: number; max?: number }> = {
  "₦0-₦5,000": { max: 5000 },
  "₦5,000-₦15,000": { min: 5000, max: 15000 },
  "₦15,000-₦30,000": { min: 15000, max: 30000 },
  "₦30,000+": { min: 30000 },
};

export type ProductFilters = {
  category?: string;
  badge?: string;
  onSale?: boolean;
  // undefined = no age filter; an empty array = match nothing (e.g. the
  // sidebar's selection doesn't overlap the age page you're on).
  ages?: string[];
  priceBands?: string[];
  inStockOnly?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  page?: number;
  perPage?: number;
};

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

function applySortStatic(products: Product[], sort: ProductFilters["sort"]): Product[] {
  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sort === "newest") sorted.reverse();
  return sorted;
}

function inPriceBands(price: number, bands: string[]): boolean {
  return bands.some((band) => {
    const range = PRICE_BANDS[band];
    if (!range) return false;
    if (range.min !== undefined && price <= range.min) return false;
    if (range.max !== undefined && price > range.max) return false;
    return true;
  });
}

/**
 * Category-page listing: category/age-group/badge/on-sale/price-band/
 * in-stock filters and sort are all pushed into the Supabase query, with
 * real .range() pagination — Supabase caps a plain select at 1000 rows by
 * default, so without this, product 1001 of an imported catalogue would
 * silently never appear anywhere, with no error.
 *
 * The one exception is the size filter: sizes is a JSONB array of
 * {id, label} objects, and "does any element's label match one of several
 * selected values" isn't expressible through PostgREST's query builder
 * without a raw SQL function. It's applied after fetching, within the
 * current page only — combined with pagination that's not perfectly
 * precise, but it's a secondary refinement, not the base listing the
 * 1000-row cap actually threatens.
 */
export async function queryProducts(filters: ProductFilters = {}): Promise<ProductPage> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? 24;

  if (!hasSupabaseConfig()) {
    let matches = staticProducts.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.badge && p.badge !== filters.badge) return false;
      if (filters.onSale && !p.compareAtPrice) return false;
      if (filters.ages && !filters.ages.includes(p.ageGroup)) return false;
      if (filters.priceBands?.length && !inPriceBands(p.price, filters.priceBands)) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      return true;
    });
    matches = applySortStatic(matches, filters.sort);
    const total = matches.length;
    const from = (page - 1) * perPage;
    return {
      products: matches.slice(from, from + perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  // Shared so the count check and the real fetch apply identical filters —
  // built fresh each call since a Supabase query builder is single-use.
  function buildFilteredQuery() {
    let query = supabasePublic.from("products").select("*", { count: "exact" }).eq("published", true);

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.badge) query = query.eq("badge", filters.badge);
    if (filters.onSale) query = query.not("compare_at_price", "is", null);
    if (filters.ages) query = query.in("age_group", filters.ages);
    if (filters.inStockOnly) query = query.eq("in_stock", true);

    if (filters.priceBands?.length) {
      // Fixed, code-defined bounds — not raw user text — so composing a
      // .or() filter string from them carries none of the injection risk
      // that user-controlled ilike patterns do (see escapeLikePattern).
      const clauses = filters.priceBands
        .map((band) => PRICE_BANDS[band])
        .filter((range): range is { min?: number; max?: number } => Boolean(range))
        .map(({ min, max }) => {
          if (min !== undefined && max !== undefined) return `and(price.gt.${min},price.lte.${max})`;
          if (max !== undefined) return `price.lte.${max}`;
          if (min !== undefined) return `price.gt.${min}`;
          return null;
        })
        .filter((clause): clause is string => Boolean(clause));
      if (clauses.length) query = query.or(clauses.join(","));
    }

    if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
    else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    return query;
  }

  // A page number beyond the actual result set (a stale bookmark, a typed
  // URL, an admin testing edge cases) has to be checked before .range() —
  // PostgREST errors with "Requested range not satisfiable" on an offset
  // past the row count instead of just returning nothing, which would
  // otherwise 500 the whole page.
  const { count: rawCount, error: countError } = await buildFilteredQuery().range(0, 0);
  if (countError) throw countError;

  const total = rawCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const clampedPage = Math.min(page, totalPages);

  if (total === 0) {
    return { products: [], total: 0, page: clampedPage, perPage, totalPages };
  }

  const from = (clampedPage - 1) * perPage;
  const { data, error } = await buildFilteredQuery().range(from, from + perPage - 1);
  if (error) throw error;

  return {
    products: ((data ?? []) as DbProduct[]).map(dbProductToProduct),
    total,
    page: clampedPage,
    perPage,
    totalPages,
  };
}
