import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(async () => ({ data: { id: "test" }, error: null })),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendOrderConfirmation } from "@/lib/email";

function shippingAddress(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "08031234567",
    state: "Lagos",
    city: "Ikeja",
    street: "12 Allen Avenue",
    newsletterOptIn: false,
    ...overrides,
  };
}

beforeEach(() => {
  process.env.RESEND_API_KEY = "test-key";
  sendMock.mockClear();
});

describe("sendOrderConfirmation — delivery details", () => {
  it("includes the delivery address and fee in the email", async () => {
    await sendOrderConfirmation({
      email: "ada@example.com",
      reference: "ref1",
      amount: 7000,
      currency: "NGN",
      items: [],
      shippingAddress: shippingAddress(),
      deliveryFee: 2000,
      deliveryStatus: "quoted",
    });

    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("12 Allen Avenue");
    expect(html).toContain("Ikeja");
    expect(html).toContain("Lagos");
    expect(html).toMatch(/₦2,000/);
  });

  it("shows a WhatsApp confirmation message instead of a fee when to_be_quoted", async () => {
    await sendOrderConfirmation({
      email: "ada@example.com",
      reference: "ref2",
      amount: 5000,
      currency: "NGN",
      items: [],
      shippingAddress: shippingAddress({ state: "Kano" }),
      deliveryFee: 0,
      deliveryStatus: "to_be_quoted",
    });

    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toMatch(/confirmed on WhatsApp/i);
  });

  it("escapes HTML in customer-entered address fields", async () => {
    await sendOrderConfirmation({
      email: "ada@example.com",
      reference: "ref3",
      amount: 5000,
      currency: "NGN",
      items: [],
      shippingAddress: shippingAddress({ fullName: "<script>alert(1)</script>" }),
      deliveryFee: 0,
      deliveryStatus: "to_be_quoted",
    });

    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("omits the delivery box entirely when there is no shipping address", async () => {
    await sendOrderConfirmation({
      email: "ada@example.com",
      reference: "ref4",
      amount: 5000,
      currency: "NGN",
      items: [],
      shippingAddress: null,
    });

    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("Delivery Details");
  });
});
