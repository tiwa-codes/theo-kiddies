import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Replays charge.success payloads through the real webhook handler,
 * mocking only Supabase (to capture what gets persisted) and the email
 * module (to capture what would be sent) — no live Paystack/Resend
 * credentials are available in this environment.
 */

const SECRET = "test_paystack_secret";

const { dbCalls, emailCalls } = vi.hoisted(() => ({
  dbCalls: { orderUpsert: null as unknown },
  emailCalls: [] as unknown[],
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "orders") {
        return {
          upsert: (row: unknown) => {
            dbCalls.orderUpsert = row;
            return Promise.resolve({ error: null });
          },
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
      reference: "TEST_REF_1_6",
      amount: 700_000,
      currency: "NGN",
      paid_at: "2026-01-01T12:00:00.000Z",
      customer: { email: "ada@example.com" },
      metadata: {
        custom_fields: [
          { display_name: "School Shirt", variable_name: "school-shirt", value: "Qty 1 · ₦5,000" },
        ],
        order_details: {
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
        },
      },
      ...overrides,
    },
  };
}

describe("POST /api/webhooks/paystack — persisting delivery + newsletter fields", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = SECRET;
    dbCalls.orderUpsert = null;
    emailCalls.length = 0;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("writes shipping_address, delivery_fee, delivery_status and newsletter fields onto the order row", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(signedRequest(chargeSuccessPayload()));
    expect(res.status).toBe(200);

    const row = dbCalls.orderUpsert as Record<string, unknown>;
    expect(row.shipping_address).toEqual({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "08031234567",
      state: "Lagos",
      city: "Ikeja",
      street: "12 Allen Avenue",
      newsletterOptIn: true,
    });
    expect(row.delivery_fee).toBe(2000);
    expect(row.delivery_status).toBe("quoted");
    expect(row.newsletter_opt_in).toBe(true);
    // Uses Paystack's own event timestamp, not `new Date()` — a redelivered
    // webhook must not re-stamp consent with a fresh time.
    expect(row.newsletter_opt_in_at).toBe("2026-01-01T12:00:00.000Z");
  });

  it("passes the shipping address and delivery fee to the confirmation email", async () => {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    await POST(signedRequest(chargeSuccessPayload()));

    const call = emailCalls[0] as Record<string, unknown>;
    expect((call.shippingAddress as Record<string, unknown>).street).toBe("12 Allen Avenue");
    expect(call.deliveryFee).toBe(2000);
    expect(call.deliveryStatus).toBe("quoted");
  });

  it("handles a payload with no order_details (legacy or non-checkout-API order) without crashing", async () => {
    const payload = chargeSuccessPayload();
    delete (payload.data.metadata as Record<string, unknown>).order_details;

    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const res = await POST(signedRequest(payload));
    expect(res.status).toBe(200);

    const row = dbCalls.orderUpsert as Record<string, unknown>;
    expect(row.shipping_address).toBeNull();
    expect(row.delivery_fee).toBe(0);
    expect(row.delivery_status).toBe("to_be_quoted");
    expect(row.newsletter_opt_in).toBe(false);
    expect(row.newsletter_opt_in_at).toBeNull();
  });
});
