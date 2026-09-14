/**
 * Fixed-window in-memory rate limiter. Good enough for a single serverless
 * instance to slow down brute-forcing an endpoint; it resets on cold start
 * and isn't shared across instances, so it's a speed bump, not a hard
 * guarantee. If that stops being good enough, replace with Upstash/Vercel KV
 * — nothing else in this project depends on the in-memory implementation.
 */
type Bucket = { count: number; windowStart: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string, now: number = Date.now()): { allowed: boolean; retryAfterMs: number } {
      const bucket = buckets.get(key);

      if (!bucket || now - bucket.windowStart >= windowMs) {
        buckets.set(key, { count: 1, windowStart: now });
        return { allowed: true, retryAfterMs: 0 };
      }

      if (bucket.count < limit) {
        bucket.count += 1;
        return { allowed: true, retryAfterMs: 0 };
      }

      return { allowed: false, retryAfterMs: windowMs - (now - bucket.windowStart) };
    },
  };
}
