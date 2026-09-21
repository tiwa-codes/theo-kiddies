import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Next.js caches fetch() responses in production, even on force-dynamic
 * pages, and supabase-js reads over fetch(). Measured on a production
 * build, that froze the admin dashboard on an empty snapshot. Both clients
 * must therefore ask for uncached responses on every request.
 */

describe("Supabase clients bypass Next's fetch cache", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    fetchMock = vi.fn(
      async () => new Response("[]", { status: 200, headers: { "content-type": "application/json" } })
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("the service-role client sends cache: no-store", async () => {
    const { getSupabase } = await import("@/lib/supabase");
    await getSupabase().from("orders").select("*");
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
  });

  it("the public (anon) client sends cache: no-store", async () => {
    const { getSupabasePublic } = await import("@/lib/supabase");
    await getSupabasePublic().from("products").select("*");
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
  });

  it("keeps the request's own headers (the API key) alongside", async () => {
    const { getSupabasePublic } = await import("@/lib/supabase");
    await getSupabasePublic().from("products").select("*");
    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.get("apikey")).toBe("anon-key");
  });
});
