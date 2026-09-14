import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    const now = 0;
    expect(limiter.check("ip1", now).allowed).toBe(true);
    expect(limiter.check("ip1", now).allowed).toBe(true);
    expect(limiter.check("ip1", now).allowed).toBe(true);
  });

  it("blocks the request after the limit is reached within the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    const now = 0;
    limiter.check("ip1", now);
    limiter.check("ip1", now);
    const result = limiter.check("ip1", now);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows requests again once the window has passed", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.check("ip1", 0);
    expect(limiter.check("ip1", 500).allowed).toBe(false);
    expect(limiter.check("ip1", 1000).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("ip1", 0).allowed).toBe(true);
    expect(limiter.check("ip2", 0).allowed).toBe(true);
    expect(limiter.check("ip1", 0).allowed).toBe(false);
    expect(limiter.check("ip2", 0).allowed).toBe(false);
  });
});
