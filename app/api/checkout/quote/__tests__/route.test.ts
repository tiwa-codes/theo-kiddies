import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliveryRatesState } = vi.hoisted(() => ({
  deliveryRatesState: { data: [] as unknown[], error: null as unknown },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve(deliveryRatesState),
      }),
    }),
  },
}));

function quoteRequest(body: unknown) {
  return new Request("http://localhost/api/checkout/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout/quote", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    deliveryRatesState.data = [];
    deliveryRatesState.error = null;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns the active rate for a state that has one", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];
    const { POST } = await import("@/app/api/checkout/quote/route");
    const res = await POST(quoteRequest({ state: "Lagos", subtotalNaira: 5000 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.fee).toBe(2000);
    expect(body.status).toBe("quoted");
  });

  it("returns to_be_quoted for a state with no active rate", async () => {
    const { POST } = await import("@/app/api/checkout/quote/route");
    const res = await POST(quoteRequest({ state: "Kano", subtotalNaira: 5000 }));
    const body = await res.json();

    expect(body.fee).toBe(0);
    expect(body.status).toBe("to_be_quoted");
    expect(body.message).toMatch(/WhatsApp/i);
  });

  it("applies free delivery at the threshold even with an active rate", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];
    const { POST } = await import("@/app/api/checkout/quote/route");
    const res = await POST(quoteRequest({ state: "Lagos", subtotalNaira: 150_000 }));
    const body = await res.json();

    expect(body.fee).toBe(0);
    expect(body.message).toMatch(/free/i);
  });

  it("rejects a state outside the seeded list without touching Supabase", async () => {
    const { POST } = await import("@/app/api/checkout/quote/route");
    const res = await POST(quoteRequest({ state: "Neverland", subtotalNaira: 5000 }));
    expect(res.status).toBe(400);
  });

  it("rejects a missing state", async () => {
    const { POST } = await import("@/app/api/checkout/quote/route");
    const res = await POST(quoteRequest({ subtotalNaira: 5000 }));
    expect(res.status).toBe(400);
  });
});
