import { describe, expect, it } from "vitest";
import { isAdminUserId, parseAdminUserIds } from "@/lib/admin-auth";

describe("parseAdminUserIds", () => {
  it("splits a comma-separated list and trims whitespace", () => {
    expect(parseAdminUserIds("user_a, user_b ,user_c")).toEqual([
      "user_a",
      "user_b",
      "user_c",
    ]);
  });

  it("returns an empty list when unset or blank", () => {
    expect(parseAdminUserIds(undefined)).toEqual([]);
    expect(parseAdminUserIds("")).toEqual([]);
    expect(parseAdminUserIds("  ,  , ")).toEqual([]);
  });
});

describe("isAdminUserId", () => {
  it("allows a user on the allowlist", () => {
    expect(isAdminUserId("user_a", "user_a,user_b")).toBe(true);
    expect(isAdminUserId("user_b", "user_a, user_b")).toBe(true);
  });

  it("rejects a signed-in user who is not on the allowlist", () => {
    // The whole point of blocker 03: any customer can sign up at /sign-up.
    expect(isAdminUserId("user_customer", "user_a,user_b")).toBe(false);
  });

  it("rejects an anonymous caller", () => {
    expect(isAdminUserId(null, "user_a")).toBe(false);
    expect(isAdminUserId(undefined, "user_a")).toBe(false);
    expect(isAdminUserId("", "user_a")).toBe(false);
  });

  it("fails closed when the allowlist is not configured", () => {
    expect(isAdminUserId("user_a", undefined)).toBe(false);
    expect(isAdminUserId("user_a", "")).toBe(false);
  });

  it("does not match on a prefix or substring", () => {
    expect(isAdminUserId("user_a", "user_abc")).toBe(false);
    expect(isAdminUserId("user_abc", "user_a")).toBe(false);
  });
});
