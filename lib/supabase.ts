import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types";

export type OrderItem = {
  display_name: string;
  variable_name: string;
  value: string;
};

export type Order = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  email: string;
  items: OrderItem[];
  status: "paid" | "failed" | "refunded";
  created_at: string;
};

export type Customer = {
  id: string;
  email: string;
  order_count: number;
  total_spent: number;
  first_seen: string;
  last_seen: string;
};

// Raw row shape from the `products` Supabase table (snake_case)
export type DbProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  badge: string | null;
  age_group: string;
  category: string;
  images: string[];
  colors: { id: string; label: string }[];
  sizes: { id: string; label: string }[];
  in_stock: boolean;
  rating: number;
  reviews: number;
  description: string | null;
  created_at: string;
};

/** Convert a Supabase row → the Product type used across the storefront */
export function dbProductToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    badge: row.badge ?? undefined,
    ageGroup: row.age_group,
    category: row.category,
    images: row.images,
    colors: row.colors,
    sizes: row.sizes,
    inStock: row.in_stock,
    rating: row.rating,
    reviews: row.reviews,
  };
}

// Lazily initialise so the build doesn't fail when env vars aren't present yet.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  _client = createClient(url, key);
  return _client;
}

// Convenience proxy — same API as before, but evaluated at call-time not import-time.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as never)[prop as keyof SupabaseClient];
  },
});
