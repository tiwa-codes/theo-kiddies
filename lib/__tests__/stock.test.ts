import { describe, expect, it } from "vitest";
import { parseStockQuantity } from "@/lib/stock";

describe("parseStockQuantity", () => {
  it("leaves stock alone when the field wasn't sent", () => {
    expect(parseStockQuantity(undefined)).toEqual({ ok: true, value: undefined });
    expect(parseStockQuantity(null)).toEqual({ ok: true, value: undefined });
  });

  it("accepts whole numbers, including 0 (meaning: stock isn't counted)", () => {
    expect(parseStockQuantity(0)).toEqual({ ok: true, value: 0 });
    expect(parseStockQuantity(12)).toEqual({ ok: true, value: 12 });
  });

  it("accepts a numeric string, as form fields arrive", () => {
    expect(parseStockQuantity("25")).toEqual({ ok: true, value: 25 });
  });

  it("rejects negatives, fractions, junk and absurd values with a message the admin can act on", () => {
    for (const bad of [-1, 2.5, "abc", "", NaN, Infinity, 1_000_001, {}, []]) {
      const result = parseStockQuantity(bad);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/whole number/i);
    }
  });
});
