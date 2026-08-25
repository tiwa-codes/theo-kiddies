import { describe, expect, it } from "vitest";
import { FREE_DELIVERY_THRESHOLD_NAIRA, calculateDeliveryFee } from "@/lib/delivery";

describe("calculateDeliveryFee", () => {
  it("is free when the subtotal is exactly at the threshold (inclusive)", () => {
    const result = calculateDeliveryFee({
      state: "Lagos",
      subtotalNaira: FREE_DELIVERY_THRESHOLD_NAIRA,
      rates: [],
    });
    expect(result.fee).toBe(0);
    expect(result.status).toBe("quoted");
    expect(result.message).toMatch(/free/i);
  });

  it("is not free one kobo under the threshold, even with an active rate", () => {
    const result = calculateDeliveryFee({
      state: "Lagos",
      subtotalNaira: 149999.99,
      rates: [{ state: "Lagos", fee: 3000, active: true }],
    });
    expect(result.fee).toBe(3000);
    expect(result.status).toBe("quoted");
    expect(result.message).not.toMatch(/free/i);
  });

  it("charges the active rate for the state", () => {
    const result = calculateDeliveryFee({
      state: "Lagos",
      subtotalNaira: 50000,
      rates: [{ state: "Lagos", fee: 3000, active: true }],
    });
    expect(result.fee).toBe(3000);
    expect(result.status).toBe("quoted");
  });

  it("returns to_be_quoted when the state has no active rate", () => {
    const result = calculateDeliveryFee({
      state: "Kano",
      subtotalNaira: 50000,
      rates: [{ state: "Kano", fee: 2000, active: false }],
    });
    expect(result.fee).toBe(0);
    expect(result.status).toBe("to_be_quoted");
    expect(result.message).toBe(
      "Delivery to Kano will be confirmed on WhatsApp before dispatch."
    );
  });

  it("returns to_be_quoted when the state has no rate row at all", () => {
    const result = calculateDeliveryFee({
      state: "Kano",
      subtotalNaira: 50000,
      rates: [],
    });
    expect(result.status).toBe("to_be_quoted");
  });

  it("free delivery beats an active rate", () => {
    const result = calculateDeliveryFee({
      state: "Lagos",
      subtotalNaira: 200000,
      rates: [{ state: "Lagos", fee: 5000, active: true }],
    });
    expect(result.fee).toBe(0);
    expect(result.status).toBe("quoted");
    expect(result.message).toMatch(/free/i);
  });

  it("throws on a state outside the seeded list — the dropdown makes this unreachable, so it must be tampering", () => {
    expect(() =>
      calculateDeliveryFee({ state: "Neverland", subtotalNaira: 10000, rates: [] })
    ).toThrow();
  });
});
