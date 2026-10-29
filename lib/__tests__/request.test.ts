import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/request";

const req = (headers: Record<string, string>) => new Request("http://localhost/", { headers });

describe("getClientIp", () => {
  it("uses the first address in x-forwarded-for", () => {
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
