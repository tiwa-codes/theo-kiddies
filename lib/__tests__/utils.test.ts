import { describe, expect, it } from "vitest";
import { collectAllPages, isValidEmail } from "@/lib/utils";

describe("isValidEmail", () => {
  it("accepts ordinary addresses, ignoring surrounding spaces", () => {
    expect(isValidEmail("Theokiddies4@gmail.com")).toBe(true);
    expect(isValidEmail("sales@theokiddies.com")).toBe(true);
    expect(isValidEmail("  sales@theokiddies.com  ")).toBe(true);
  });

  it("rejects malformed or missing addresses", () => {
    for (const input of ["", "no-at-sign", "two@@signs.com", "spaces in@it.com", "user@nodot", "user@domain.c"]) {
      expect(isValidEmail(input)).toBe(false);
    }
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });
});

describe("collectAllPages", () => {
  /** Fake paged query over `total` rows, recording each range asked for. */
  function fakePages(total: number, calls: Array<[number, number]>) {
    return (from: number, to: number) => {
      calls.push([from, to]);
      const rows = Array.from({ length: Math.max(0, Math.min(to, total - 1) - from + 1) }, (_, i) => from + i);
      return Promise.resolve({ data: rows, error: null });
    };
  }

  it("keeps fetching past Supabase's 1000-row limit until a short page", async () => {
    const calls: Array<[number, number]> = [];
    const rows = await collectAllPages(fakePages(2500, calls));
    expect(rows).toHaveLength(2500);
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it("stops after one request when everything fits", async () => {
    const calls: Array<[number, number]> = [];
    expect(await collectAllPages(fakePages(3, calls))).toEqual([0, 1, 2]);
    expect(calls).toHaveLength(1);
  });

  it("makes one extra request when the total is an exact multiple of the page size", async () => {
    const calls: Array<[number, number]> = [];
    expect(await collectAllPages(fakePages(1000, calls))).toHaveLength(1000);
    expect(calls).toEqual([[0, 999], [1000, 1999]]);
  });

  it("throws the database error instead of returning a partial list", async () => {
    const failing = () => Promise.resolve({ data: null, error: new Error("db down") });
    let caught: unknown = null;
    try {
      await collectAllPages(failing);
    } catch (err) {
      caught = err;
    }
    expect(caught instanceof Error && caught.message).toBe("db down");
  });
});
