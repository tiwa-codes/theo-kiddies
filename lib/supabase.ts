import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types";
import type { ShippingAddress } from "@/lib/checkout";

// Legacy display-string shape — still used for the confirmation email and
// Paystack's cosmetic custom_fields, but no longer what's stored on orders.
export type OrderItem = {
  display_name: string;
  variable_name: string;
  value: string;
};

// What's actually stored in orders.items: numeric quantities and product
// IDs, written by the checkout API itself rather than echoed back from
// Paystack metadata.
export type OrderLineItem = {
  productId: string;
  slug: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  size?: string;
  color?: string;
};

export type Order = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  email: string;
  items: OrderLineItem[];
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  shipping_address: ShippingAddress | null;
  delivery_fee: number;
  delivery_status: "quoted" | "to_be_quoted";
  newsletter_opt_in: boolean;
  newsletter_opt_in_at: string | null;
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
  sku: string | null;
  stock_quantity: number;
  published: boolean;
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

/**
 * supabase-js talks to the database over fetch(), and Next.js caches fetch()
 * responses in production — even on a page marked `dynamic = "force-dynamic"`.
 * Measured on a production build: with only force-dynamic, a product added
 * to the table never showed up in a count or a listing; with the responses
 * uncached it appeared immediately. That is why the admin dashboard sat at 0
 * products (a snapshot from when the table was empty) and why storefront
 * pages can drift from the database. This is store data that changes
 * constantly (stock, prices, orders), so nothing here should be cached.
 */
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

function createUncachedClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, { global: { fetch: noStoreFetch } });
}

// Lazily initialise so the build doesn't fail when env vars aren't present yet.
let _client: SupabaseClient | null = null;

/**
 * Service-role client — bypasses RLS entirely. For admin writes, checkout,
 * and webhooks: anything that legitimately needs to read or write past what
 * a public policy allows. Never use this for a storefront read a browser
 * triggers; use getSupabasePublic() instead.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  _client = createUncachedClient(url, key);
  return _client;
}

// Convenience proxy — same API as before, but evaluated at call-time not import-time.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as never)[prop as keyof SupabaseClient];
  },
});

let _publicClient: SupabaseClient | null = null;

/**
 * Anon-key client — subject to RLS, same as a request from the browser
 * would be. For public storefront reads (products, search): the "Public
 * can read products" policy in schema.sql is what actually authorises
 * these, not application code deciding to trust itself.
 */
export function getSupabasePublic(): SupabaseClient {
  if (_publicClient) return _publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  _publicClient = createUncachedClient(url, key);
  return _publicClient;
}

export const supabasePublic: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabasePublic() as never)[prop as keyof SupabaseClient];
  },
});

/**
 * Escape ilike's wildcard characters in untrusted input before passing it
 * to `.ilike()`. Without this, a value of "%" matches every row — turning
 * "I know someone's email" into "I can see all of their orders" without
 * ever knowing a single valid reference. Use whenever user input drives a
 * case-insensitive exact-match lookup, not a real search.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
