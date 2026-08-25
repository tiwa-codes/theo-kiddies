import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types";

/**
 * These exercise the real route handler end to end — real parsing, real
 * pricing, real delivery-fee calculation — mocking only the two things
 * that talk to the network: Supabase (delivery rates) and Paystack (fetch).
 * That's what makes "the Paystack amount differs correctly" checkable
 * without live credentials.
 */

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

vi.mock("@/lib/products", () => ({
  getProductsBySlugs: vi.fn(async (slugs: string[]): Promise<Product[]> =>
    slugs.map((slug) => ({
      id: slug,
      slug,
      title: "School Shirt",
      price: 5000,
      ageGroup: "4-7 Years",
      category: "Clothing",
      images: [],
      rating: 5,
      reviews: 0,
      colors: [],
      sizes: [],
      inStock: true,
    }))
  ),
}));

function validAddress(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "08031234567",
    state: "Lagos",
    city: "Ikeja",
    street: "12 Allen Avenue",
    ...overrides,
  };
}

function checkoutRequest(body: unknown) {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout — delivery fee wiring", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    deliveryRatesState.data = [];
    deliveryRatesState.error = null;

    fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        status: true,
        data: { authorization_url: "https://paystack.test/pay", reference: "ref_test" },
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("adds the active state rate to the Paystack amount", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Lagos" }),
      })
    );
    const body = await res.json();

    const paystackBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(paystackBody.amount).toBe(700_000); // ₦5,000 product + ₦2,000 delivery, in kobo
    expect(paystackBody.metadata.order_details.delivery_fee).toBe(2000);
    expect(paystackBody.metadata.order_details.delivery_status).toBe("quoted");
    expect(body.deliveryFee).toBe(2000);
    expect(body.deliveryStatus).toBe("quoted");
  });

  it("charges nothing extra when the state has no active rate", async () => {
    deliveryRatesState.data = [];

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Kano" }),
      })
    );
    const body = await res.json();

    const paystackBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(paystackBody.amount).toBe(500_000); // ₦5,000 product only
    expect(paystackBody.metadata.order_details.delivery_status).toBe("to_be_quoted");
    expect(body.deliveryFee).toBe(0);
    expect(body.deliveryStatus).toBe("to_be_quoted");
  });

  it("the two amounts differ by exactly the delivery fee", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];
    const { POST: postWithRate } = await import("@/app/api/checkout/route");
    await postWithRate(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Lagos" }),
      })
    );
    const amountWithRate = JSON.parse(fetchMock.mock.calls[0][1].body as string).amount;

    deliveryRatesState.data = [];
    await postWithRate(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Kano" }),
      })
    );
    const amountWithoutRate = JSON.parse(fetchMock.mock.calls[1][1].body as string).amount;

    expect(amountWithRate - amountWithoutRate).toBe(200_000); // ₦2,000 in kobo
  });

  it("puts shipping_address, delivery_fee and delivery_status under one metadata key, not custom_fields", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];

    const { POST } = await import("@/app/api/checkout/route");
    await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Lagos" }),
      })
    );

    const paystackBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(paystackBody.metadata.order_details.shipping_address.state).toBe("Lagos");
    expect(paystackBody.metadata.custom_fields.some((f: { value: string }) =>
      /address|street/i.test(f.value)
    )).toBe(false);
  });

  it("rejects a request with an invalid address before calling Paystack", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Neverland" }),
      })
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
