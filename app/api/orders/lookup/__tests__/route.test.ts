import { describe, expect, it, vi } from "vitest";
import { escapeLikePattern } from "@/lib/supabase";

/**
 * The mock simulates real ilike/eq filtering (case-insensitive exact match
 * on the escaped reference, exact match on email) rather than just
 * returning canned data — otherwise a test asserting "wrong email finds
 * nothing" would pass even if the route forgot to filter on email at all.
 * escapeLikePattern is kept real (not mocked) since it's exactly what's
 * under test in the describe block below.
 */
const { dbState } = vi.hoisted(() => ({
  dbState: {
    storedOrder: null as null | Record<string, unknown> & { reference: string; email: string },
  },
}));

vi.mock("@/lib/supabase", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/supabase")>()),
  supabase: {
    from: () => ({
      select: () => ({
        ilike: (_col: string, refPattern: string) => ({
          eq: (_col2: string, email: string) => ({
            maybeSingle: () => {
              const stored = dbState.storedOrder;
              if (!stored) return Promise.resolve({ data: null, error: null });
              const refMatches = stored.reference.toLowerCase() === refPattern.toLowerCase();
              const emailMatches = stored.email === email;
              return Promise.resolve({
                data: refMatches && emailMatches ? stored : null,
                error: null,
              });
            },
          }),
        }),
      }),
    }),
  },
}));

function storedOrder(overrides: Record<string, unknown> = {}) {
  return {
    reference: "abc123ref",
    email: "ada@example.com",
    amount: 5000,
    currency: "NGN",
    items: [],
    status: "paid",
    created_at: "2026-01-01T00:00:00.000Z",
    shipping_address: null,
    delivery_fee: 0,
    delivery_status: "to_be_quoted",
    ...overrides,
  };
}

function lookupRequest(body: unknown, ip: string) {
  return new Request("http://localhost/api/orders/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/lookup", () => {
  it("returns the order when the reference and email both match", async () => {
    dbState.storedOrder = storedOrder();
    const { POST } = await import("@/app/api/orders/lookup/route");

    const res = await POST(
      lookupRequest({ reference: "abc123ref", email: "ada@example.com" }, "10.0.1.1")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reference).toBe("abc123ref");
    expect(body.status).toBe("paid");
  });

  it("finds the order even when the reference is typed in a different case", async () => {
    dbState.storedOrder = storedOrder();
    const { POST } = await import("@/app/api/orders/lookup/route");

    const res = await POST(
      lookupRequest({ reference: "ABC123REF", email: "ada@example.com" }, "10.0.1.2")
    );
    expect(res.status).toBe(200);
  });

  it("returns nothing for a correct reference with the wrong email — the exact case the task calls out", async () => {
    dbState.storedOrder = storedOrder();
    const { POST } = await import("@/app/api/orders/lookup/route");

    const res = await POST(
      lookupRequest({ reference: "abc123ref", email: "wrong@example.com" }, "10.0.1.3")
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.reference).toBeUndefined();
    expect(body.amount).toBeUndefined();
  });

  it("returns nothing for the correct email with the wrong reference", async () => {
    dbState.storedOrder = storedOrder();
    const { POST } = await import("@/app/api/orders/lookup/route");

    const res = await POST(
      lookupRequest({ reference: "not-the-real-ref", email: "ada@example.com" }, "10.0.1.4")
    );
    expect(res.status).toBe(404);
  });

  it("gives identical responses for a wrong email and an unknown reference — no side channel", async () => {
    dbState.storedOrder = storedOrder();
    const { POST } = await import("@/app/api/orders/lookup/route");

    const wrongEmail = await POST(
      lookupRequest({ reference: "abc123ref", email: "wrong@example.com" }, "10.0.1.5")
    );
    const unknownRef = await POST(
      lookupRequest({ reference: "totally-unknown", email: "ada@example.com" }, "10.0.1.6")
    );
    expect(wrongEmail.status).toBe(unknownRef.status);
    expect(await wrongEmail.json()).toEqual(await unknownRef.json());
  });

  it("rejects a missing reference", async () => {
    const { POST } = await import("@/app/api/orders/lookup/route");
    const res = await POST(lookupRequest({ email: "ada@example.com" }, "10.0.1.7"));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const { POST } = await import("@/app/api/orders/lookup/route");
    const res = await POST(lookupRequest({ reference: "abc123ref", email: "not-an-email" }, "10.0.1.8"));
    expect(res.status).toBe(400);
  });

  it("rate limits repeated attempts from the same IP", async () => {
    dbState.storedOrder = null;
    const { POST } = await import("@/app/api/orders/lookup/route");
    const ip = "10.0.2.1";

    let lastStatus = 200;
    for (let i = 0; i < 11; i++) {
      const res = await POST(lookupRequest({ reference: "x", email: "ada@example.com" }, ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("does not rate limit a different IP", async () => {
    dbState.storedOrder = null;
    const { POST } = await import("@/app/api/orders/lookup/route");

    for (let i = 0; i < 10; i++) {
      await POST(lookupRequest({ reference: "x", email: "ada@example.com" }, "10.0.3.1"));
    }
    const res = await POST(lookupRequest({ reference: "x", email: "ada@example.com" }, "10.0.3.2"));
    expect(res.status).not.toBe(429);
  });
});

describe("escapeLikePattern", () => {
  it("escapes ilike wildcard characters so a reference can't become a search pattern", () => {
    expect(escapeLikePattern("%")).toBe("\\%");
    expect(escapeLikePattern("_")).toBe("\\_");
    expect(escapeLikePattern("50%_off\\")).toBe("50\\%\\_off\\\\");
  });

  it("leaves ordinary reference characters untouched", () => {
    expect(escapeLikePattern("abc123REF")).toBe("abc123REF");
  });
});
