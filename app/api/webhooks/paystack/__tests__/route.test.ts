import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Replays charge.success payloads through the real webhook handler,
 * mocking only Supabase (to capture what gets persisted) and the email
 * module (to capture what would be sent) — no live Paystack/Resend
 * credentials are available in this environment.
 *
 * Since blocker 4.4, the order row already exists (written by the
 * checkout API as 'pending') before this webhook ever runs — the mock
 * models that: `orderRow` is what "the database" already has, and the
 * webhook's job is only to flip it to 'paid' and read it back, never to
 * reconstruct order data from the Paystack event itself.
 *
 * The orders mock also models the .neq("status", "paid") guard added in
 * 4.5: the update only "succeeds" (returns a row) when the stored status
 * isn't already "paid" — so a redelivered webhook naturally sees no row,
 * the same as the real query would.
 */

const SECRET = "test_paystack_secret";

const { orderRow, updatePatches, rpcCalls, emailCalls } = vi.hoisted(() => ({
  orderRow: { current: null as null | Record<string, unknown> },
  updatePatches: [] as unknown[],
  rpcCalls: [] as Array<{ fn: string; params: unknown }>,
  emailCalls: [] as unknown[],
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "orders") {
        return {
          update: (patch: Record<string, unknown>) => ({
            eq: (_col: string, ref: string) => ({
              neq: (_col2: string, excludedStatus: string) => ({
                select: () => ({
                  maybeSingle: () => {
                    const row = orderRow.current;
                    if (!row || row.reference !== ref || row.status === excludedStatus) {
                      return Promise.resolve({ data: null, error: null });
                    }
                    updatePatches.push(patch);
                    Object.assign(row, patch);
                    return Promise.resolve({ data: { ...row }, error: null });
                  },
                }),
              }),
            }),
          }),
          select: () => ({
            eq: (_col: string, ref: string) => ({
              maybeSingle: () => {
                const row = orderRow.current;
                if (!row || row.reference !== ref) return Promise.resolve({ data: null, error: null });
                return Promise.resolve({ data: { id: "order-1" }, error: null });
              },
            }),
          }),
        };
      }
      if (table === "customers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      throw new Error(`Unexpected table in test: ${table}`);
    },
    rpc: (fn: string, params: unknown) => {
      rpcCalls.push({ fn, params });
      return Promise.resolve({ error: null });
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendOrderConfirmation: vi.fn(async (args: unknown) => {
    emailCalls.push(args);
  }),
}));

function signedRequest(payload: unknown) {
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac("sha512", SECRET).update(rawBody).digest("hex");
  return new Request("http://localhost/api/webhooks/paystack", {
    method: "POST",
    headers: { "x-paystack-signature": signature },
    body: rawBody,
  });
}

function chargeSuccessPayload(overrides: Record<string, unknown> = {}) {
  return {
    event: "charge.success",
    data: {
      reference: "test-ref-4-4",
      amount: 1_200_000,
      currency: "NGN",
      paid_at: "2026-01-01T12:00:00.000Z",
      customer: { email: "ada@example.com" },
      // Deliberately bogus — proves the webhook doesn't read order data
      // out of Paystack's echo any more, only the reference.
      metadata: { custom_fields: [{ display_name: "IGNORE ME", variable_name: "x", value: "x" }] },
      ...overrides,
    },
  };
}

function pendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    reference: "test-ref-4-4",
    amount: 12000,
    currency: "NGN",
    email: "ada@example.com",
    status: "pending",
    items: [
      {
        productId: "prod-1",
        slug: "school-shirt",
        title: "School Shirt",
        quantity: 2,
        unitPrice: 5000,
        lineTotal: 10000,
        size: "m",
      },
    ],
    shipping_address: {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "08031234567",
      state: "Lagos",
      city: "Ikeja",
      street: "12 Allen Avenue",
      newsletterOptIn: true,
    },
    delivery_fee: 2000,
    delivery_status: "quoted",
    ...overrides,
  };
}

describe("POST /api/webhooks/paystack — flips an existing order to paid (4.4)", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = SECRET;
    orderRow.current = pendingOrder();
    updatePatches.length = 0;
    rpcCalls.length = 0;
    emailCalls.length = 0;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("flips the matching pending order to paid", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(signedRequest(chargeSuccessPayload()));
    expect(res.status).toBe(200);
    expect(updatePatches[0]).toEqual({ status: "paid" });
    expect(orderRow.current?.status).toBe("paid");
  });

  it("sends the confirmation email using the order row's own data, ignoring Paystack's metadata entirely", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    await POST(signedRequest(chargeSuccessPayload()));

    const call = emailCalls[0] as Record<string, unknown>;
    expect(call.email).toBe("ada@example.com");
    expect(call.amount).toBe(12000);
    expect((call.shippingAddress as Record<string, unknown>).street).toBe("12 Allen Avenue");
    expect(call.deliveryFee).toBe(2000);
    expect(call.deliveryStatus).toBe("quoted");
    // The bogus custom_fields from the Paystack payload must never appear.
    expect(JSON.stringify(call)).not.toContain("IGNORE ME");
  });

  it("builds structured display strings for the email from numeric quantity and lineTotal", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    await POST(signedRequest(chargeSuccessPayload()));

    const call = emailCalls[0] as { items: Array<{ display_name: string; value: string }> };
    expect(call.items).toEqual([
      { display_name: "School Shirt", variable_name: "school-shirt", value: "Qty 2 · Size m · ₦10,000" },
    ]);
  });

  it("does nothing destructive and still returns 200 when no order matches the reference", async () => {
    orderRow.current = null;
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(signedRequest(chargeSuccessPayload()));
    expect(res.status).toBe(200);
    expect(emailCalls).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("rejects a request with an invalid signature", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/paystack", {
        method: "POST",
        headers: { "x-paystack-signature": "not-the-real-signature" },
        body: JSON.stringify(chargeSuccessPayload()),
      })
    );
    expect(res.status).toBe(401);
    expect(emailCalls).toHaveLength(0);
  });
});

describe("POST /api/webhooks/paystack — stock decrement on payment (4.5)", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = SECRET;
    updatePatches.length = 0;
    rpcCalls.length = 0;
    emailCalls.length = 0;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("decrements stock for the purchased product via the atomic RPC function", async () => {
    orderRow.current = pendingOrder();
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    await POST(signedRequest(chargeSuccessPayload()));

    expect(rpcCalls).toEqual([{ fn: "decrement_product_stock", params: { p_id: "prod-1", qty: 2 } }]);
  });

  it("aggregates quantities when the same product appears in multiple line items", async () => {
    orderRow.current = pendingOrder({
      items: [
        { productId: "prod-1", slug: "a", title: "A", quantity: 1, unitPrice: 1000, lineTotal: 1000 },
        { productId: "prod-1", slug: "a", title: "A", quantity: 3, unitPrice: 1000, lineTotal: 3000, size: "l" },
        { productId: "prod-2", slug: "b", title: "B", quantity: 1, unitPrice: 500, lineTotal: 500 },
      ],
    });
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    await POST(signedRequest(chargeSuccessPayload()));

    expect(rpcCalls).toHaveLength(2);
    expect(rpcCalls).toContainEqual({ fn: "decrement_product_stock", params: { p_id: "prod-1", qty: 4 } });
    expect(rpcCalls).toContainEqual({ fn: "decrement_product_stock", params: { p_id: "prod-2", qty: 1 } });
  });

  it("does not decrement stock or resend the email on a redelivered webhook for an already-paid order", async () => {
    orderRow.current = pendingOrder({ status: "paid" });
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(signedRequest(chargeSuccessPayload()));

    expect(res.status).toBe(200);
    expect(rpcCalls).toHaveLength(0);
    expect(emailCalls).toHaveLength(0);
    expect(updatePatches).toHaveLength(0);
  });
});
