import { describe, expect, it } from "vitest";
import {
  MAX_QUANTITY_PER_LINE,
  parseRequestedItems,
  parseShippingAddress,
  priceOrder,
} from "@/lib/checkout";
import type { Product } from "@/types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "school-shirt",
    title: "School Shirt",
    price: 4500,
    ageGroup: "4-5 Years",
    category: "Clothing",
    gender: "Unisex",
    images: [],
    rating: 5,
    reviews: 0,
    colors: [],
    sizes: [],
    inStock: true,
    ...overrides,
  };
}

describe("parseRequestedItems", () => {
  it("keeps only slug, quantity and variant labels", () => {
    const parsed = parseRequestedItems([
      { slug: "school-shirt", quantity: 2, color: "white", size: "s", price: 1, title: "hacked" },
    ]);
    expect(parsed).toEqual([{ slug: "school-shirt", quantity: 2, color: "white", size: "s" }]);
  });

  it("rejects a non-array payload", () => {
    expect(() => parseRequestedItems(null)).toThrow();
    expect(() => parseRequestedItems({ slug: "x" })).toThrow();
    expect(() => parseRequestedItems([])).toThrow();
  });

  it("rejects quantities that are not positive whole numbers", () => {
    expect(() => parseRequestedItems([{ slug: "a", quantity: 0 }])).toThrow();
    expect(() => parseRequestedItems([{ slug: "a", quantity: -3 }])).toThrow();
    expect(() => parseRequestedItems([{ slug: "a", quantity: 1.5 }])).toThrow();
    expect(() => parseRequestedItems([{ slug: "a", quantity: "2" }])).toThrow();
  });

  it("caps the quantity per line", () => {
    expect(() =>
      parseRequestedItems([{ slug: "a", quantity: MAX_QUANTITY_PER_LINE + 1 }])
    ).toThrow();
  });

  it("rejects an item with no slug", () => {
    expect(() => parseRequestedItems([{ quantity: 1 }])).toThrow();
  });
});

describe("priceOrder", () => {
  it("prices from the catalogue, never from the request", () => {
    // The whole point of blocker 01: a tampered price must have no effect.
    const result = priceOrder(
      [{ slug: "school-shirt", quantity: 2 }],
      [product({ price: 4500 })]
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subtotalNaira).toBe(9000);
    expect(result.amountKobo).toBe(900000);
    expect(result.lines[0].unitPrice).toBe(4500);
  });

  it("handles kobo without floating point drift", () => {
    const result = priceOrder(
      [{ slug: "school-shirt", quantity: 3 }],
      [product({ price: 1999.99 })]
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.amountKobo).toBe(599997);
  });

  it("sums multiple lines", () => {
    const result = priceOrder(
      [
        { slug: "school-shirt", quantity: 2 },
        { slug: "lunch-box", quantity: 1 },
      ],
      [product({ price: 4500 }), product({ slug: "lunch-box", id: "p2", price: 3000 })]
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subtotalNaira).toBe(12000);
  });

  it("fails when a slug is not in the catalogue", () => {
    const result = priceOrder([{ slug: "ghost", quantity: 1 }], [product()]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/no longer available/i);
  });

  it("fails when an item is out of stock", () => {
    const result = priceOrder(
      [{ slug: "school-shirt", quantity: 1 }],
      [product({ inStock: false })]
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/out of stock/i);
  });

  it("fails on a non-positive catalogue price rather than charging zero", () => {
    const result = priceOrder(
      [{ slug: "school-shirt", quantity: 1 }],
      [product({ price: 0 })]
    );
    expect(result.ok).toBe(false);
  });
});

function shippingAddress(overrides: Record<string, unknown> = {}) {
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

describe("parseShippingAddress", () => {
  it("parses a valid minimal address, defaulting optional fields", () => {
    const address = parseShippingAddress(shippingAddress());
    expect(address).toEqual({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "08031234567",
      state: "Lagos",
      city: "Ikeja",
      street: "12 Allen Avenue",
      newsletterOptIn: false,
    });
  });

  it("accepts optional fields when provided", () => {
    const address = parseShippingAddress(
      shippingAddress({
        altPhone: "07031234567",
        landmark: "Opposite the blue gate",
        notes: "Leave with the gateman",
        newsletterOptIn: true,
      })
    );
    expect(address.altPhone).toBe("07031234567");
    expect(address.landmark).toBe("Opposite the blue gate");
    expect(address.notes).toBe("Leave with the gateman");
    expect(address.newsletterOptIn).toBe(true);
  });

  it("trims whitespace from every string field", () => {
    const address = parseShippingAddress(
      shippingAddress({ fullName: "  Ada Lovelace  ", city: "  Ikeja ", street: " 12 Allen Avenue " })
    );
    expect(address.fullName).toBe("Ada Lovelace");
    expect(address.city).toBe("Ikeja");
    expect(address.street).toBe("12 Allen Avenue");
  });

  it("rejects a missing state", () => {
    const { state, ...rest } = shippingAddress();
    expect(() => parseShippingAddress(rest)).toThrow();
  });

  it("rejects a state outside the seeded list", () => {
    expect(() => parseShippingAddress(shippingAddress({ state: "Neverland" }))).toThrow();
  });

  it("rejects a UK phone number", () => {
    expect(() => parseShippingAddress(shippingAddress({ phone: "+447911123456" }))).toThrow();
  });

  it("newsletterOptIn defaults to false when absent", () => {
    const { newsletterOptIn, ...rest } = shippingAddress();
    expect(parseShippingAddress(rest).newsletterOptIn).toBe(false);
  });

  it("newsletterOptIn never becomes true from a truthy non-boolean", () => {
    expect(parseShippingAddress(shippingAddress({ newsletterOptIn: "true" })).newsletterOptIn).toBe(
      false
    );
    expect(parseShippingAddress(shippingAddress({ newsletterOptIn: 1 })).newsletterOptIn).toBe(
      false
    );
  });

  it("rejects a missing or invalid email", () => {
    const { email, ...rest } = shippingAddress();
    expect(() => parseShippingAddress(rest)).toThrow();
    expect(() => parseShippingAddress(shippingAddress({ email: "not-an-email" }))).toThrow();
  });

  it("rejects each missing required field", () => {
    for (const field of ["fullName", "city", "street"]) {
      const address = shippingAddress();
      delete (address as Record<string, unknown>)[field];
      expect(() => parseShippingAddress(address)).toThrow();
    }
  });

  it("rejects a field that is too long", () => {
    expect(() =>
      parseShippingAddress(shippingAddress({ street: "x".repeat(500) }))
    ).toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => parseShippingAddress(null)).toThrow();
    expect(() => parseShippingAddress("address")).toThrow();
    expect(() => parseShippingAddress([])).toThrow();
  });
});
