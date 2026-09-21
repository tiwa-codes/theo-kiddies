import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * There is no built-in fallback catalogue. When Supabase isn't configured
 * the storefront must show nothing — never invented products with invented
 * prices, which is what a fallback of demo products did on the live site
 * when one env var was missing.
 */

const { queryLog } = vi.hoisted(() => ({ queryLog: { inIds: null as null | string[] } }));

vi.mock("@/lib/supabase", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/supabase")>()),
  supabasePublic: {
    from: () => ({
      select: () => ({
        eq: () => ({
          in: (_col: string, ids: string[]) => {
            queryLog.inIds = ids;
            return Promise.resolve({ data: [], error: null });
          },
        }),
      }),
    }),
  },
}));

const URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

describe("products with Supabase not configured", () => {
  const saved = { url: process.env[URL_KEY], anon: process.env[ANON_KEY] };

  beforeEach(() => {
    delete process.env[URL_KEY];
    delete process.env[ANON_KEY];
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (saved.url) process.env[URL_KEY] = saved.url;
    if (saved.anon) process.env[ANON_KEY] = saved.anon;
    vi.restoreAllMocks();
  });

  it("lists nothing rather than inventing products", async () => {
    const { getAllProducts, getProductBySlug, searchProducts, queryProducts } = await import(
      "@/lib/products"
    );
    expect(await getAllProducts()).toEqual([]);
    expect(await getProductBySlug("anything")).toBeNull();
    expect(await searchProducts("shirt")).toEqual([]);
    const page = await queryProducts({});
    expect(page.products).toEqual([]);
    expect(page.total).toBe(0);
  });

  it("refuses to price an order instead of guessing a price", async () => {
    const { getProductsBySlugs } = await import("@/lib/products");
    await expect(getProductsBySlugs(["some-shirt"])).rejects.toThrow(/Cannot price/);
  });

  it("says why, so a missing env var is visible in the logs", async () => {
    const { getAllProducts } = await import("@/lib/products");
    await getAllProducts();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  });
});

describe("getProductsByIds", () => {
  beforeEach(() => {
    process.env[URL_KEY] = "https://example.supabase.co";
    process.env[ANON_KEY] = "anon";
    queryLog.inIds = null;
  });

  it("drops anything that isn't a uuid before querying (localStorage ids are untrusted)", async () => {
    const { getProductsByIds } = await import("@/lib/products");
    const good = "4a7d76b4-130a-4ec2-9da2-0d751854ab87";
    await getProductsByIds([good, "not-a-uuid", "1; drop table products", good]);
    expect(queryLog.inIds).toEqual([good]);
  });

  it("doesn't query at all when nothing valid is left", async () => {
    const { getProductsByIds } = await import("@/lib/products");
    expect(await getProductsByIds(["nope"])).toEqual([]);
    expect(queryLog.inIds).toBeNull();
  });
});
