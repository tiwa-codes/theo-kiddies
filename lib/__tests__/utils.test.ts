import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/utils";

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
