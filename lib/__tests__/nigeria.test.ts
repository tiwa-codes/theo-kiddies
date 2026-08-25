import { describe, expect, it } from "vitest";
import { NIGERIAN_STATES, isValidNigerianPhone } from "@/lib/nigeria";

describe("NIGERIAN_STATES", () => {
  it("has 37 entries: 36 states plus FCT", () => {
    expect(NIGERIAN_STATES).toHaveLength(37);
  });

  it("includes FCT (Abuja) and a sample of states", () => {
    expect(NIGERIAN_STATES).toContain("FCT (Abuja)");
    expect(NIGERIAN_STATES).toContain("Lagos");
    expect(NIGERIAN_STATES).toContain("Kano");
    expect(NIGERIAN_STATES).toContain("Rivers");
  });

  it("has no duplicates", () => {
    expect(new Set(NIGERIAN_STATES).size).toBe(NIGERIAN_STATES.length);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(NIGERIAN_STATES)).toBe(true);
  });
});

describe("isValidNigerianPhone", () => {
  it("accepts local format (0...)", () => {
    expect(isValidNigerianPhone("08031234567")).toBe(true);
    expect(isValidNigerianPhone("07031234567")).toBe(true);
    expect(isValidNigerianPhone("09011234567")).toBe(true);
  });

  it("accepts +234 format", () => {
    expect(isValidNigerianPhone("+2348031234567")).toBe(true);
  });

  it("accepts 234 format without the plus", () => {
    expect(isValidNigerianPhone("2348031234567")).toBe(true);
  });

  it("rejects a number that is too short", () => {
    expect(isValidNigerianPhone("080312345")).toBe(false);
  });

  it("rejects a number that is too long", () => {
    expect(isValidNigerianPhone("080312345678")).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidNigerianPhone("0803abc4567")).toBe(false);
  });

  it("rejects a UK number", () => {
    expect(isValidNigerianPhone("+447911123456")).toBe(false);
    expect(isValidNigerianPhone("447911123456")).toBe(false);
  });

  it("rejects empty or non-string input", () => {
    expect(isValidNigerianPhone("")).toBe(false);
    // @ts-expect-error - deliberately wrong type, mirrors untrusted request bodies
    expect(isValidNigerianPhone(undefined)).toBe(false);
  });
});
