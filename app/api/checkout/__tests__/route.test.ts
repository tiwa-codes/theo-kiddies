import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types";

/**
 * These exercise the real route handler end to end — real parsing, real
 * pricing, real delivery-fee calculation — mocking only the two things
 * that talk to the network: Supabase (order insert + delivery rates) and
 * Paystack (fetch). Since blocker 4.4, the checkout API writes the order
 * row itself before ever calling Paystack, so that's what these assert on.
 */

const { insertedOrders, deliveryRatesState } = vi.hoisted(() => ({
  insertedOrders: [] as unknown[],
  deliveryRatesState: { data: [] as unknown[], error: null as unknown },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "orders") {
        return {
          insert: (row: unknown) => {
            insertedOrders.push(row);
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === "delivery_rates") {
        return {
          select: () => ({
            eq: () => Promise.resolve(deliveryRatesState),
          }),
        };
      }
      throw new Error(`Unexpected table in test: ${table}`);
    },
  },
}));

vi.mock("@/lib/products", () => ({
  getProductsBySlugs: vi.fn(async (slugs: string[]): Promise<Product[]> =>
    slugs.map((slug) => ({
      id: `product-id-${slug}`,
      slug,
      title: "School Shirt",
      price: 5000,
      ageGroup: "4-5 Years",
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

describe("POST /api/checkout — writes its own order row (4.4)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    deliveryRatesState.data = [];
    deliveryRatesState.error = null;
    insertedOrders.length = 0;

    fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
      const sentBody = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          status: true,
          // Paystack echoes back whatever reference we sent it.
          data: { authorization_url: "https://paystack.test/pay", reference: sentBody.reference },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("writes a pending order with structured line items before calling Paystack", async () => {
    deliveryRatesState.data = [{ state: "Lagos", fee: 2000, active: true }];
    const { POST } = await import("@/app/api/checkout/route");

    await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 2, size: "m", color: "coral" }],
        address: validAddress({ state: "Lagos" }),
      })
    );

    expect(insertedOrders).toHaveLength(1);
    const row = insertedOrders[0] as Record<string, unknown>;
    expect(row.status).toBe("pending");
    expect(row.amount).toBe(12000); // 2 x ₦5,000 + ₦2,000 delivery
    expect(row.email).toBe("ada@example.com");
    expect(row.delivery_fee).toBe(2000);
    expect(row.delivery_status).toBe("quoted");

    const items = row.items as Array<Record<string, unknown>>;
    expect(items).toEqual([
      {
        productId: "product-id-school-shirt",
        slug: "school-shirt",
        title: "School Shirt",
        quantity: 2,
        unitPrice: 5000,
        lineTotal: 10000,
        color: "coral",
        size: "m",
      },
    ]);
  });

  it("passes its own reference to Paystack instead of letting Paystack generate one", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress(),
      })
    );
    const body = await res.json();

    const paystackBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const insertedRow = insertedOrders[0] as Record<string, unknown>;

    expect(paystackBody.reference).toBeTruthy();
    expect(paystackBody.reference).toBe(insertedRow.reference);
    expect(body.reference).toBe(paystackBody.reference);
  });

  it("sends only cosmetic custom_fields to Paystack — no shipping address or order data in metadata", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress(),
      })
    );

    const paystackBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(paystackBody.metadata.order_details).toBeUndefined();
    expect(paystackBody.metadata.custom_fields).toBeDefined();
    expect(JSON.stringify(paystackBody.metadata)).not.toContain("Allen Avenue");
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

  it("rejects a request with an invalid address before writing an order or calling Paystack", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(
      checkoutRequest({
        items: [{ slug: "school-shirt", quantity: 1 }],
        address: validAddress({ state: "Neverland" }),
      })
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(insertedOrders).toHaveLength(0);
  });
});
