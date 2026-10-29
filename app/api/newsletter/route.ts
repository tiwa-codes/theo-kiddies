import { createRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { parseSubscribeInput } from "@/lib/newsletter";
import { addSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

// Public endpoint: slow down anyone scripting signups.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(req: Request) {
  const { allowed, retryAfterMs } = limiter.check(getClientIp(req));
  if (!allowed) {
    return Response.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const parsed = parseSubscribeInput(await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    await addSubscriber(parsed.email, parsed.source);
    // Same answer whether or not the email was already on the list, so this
    // can't be used to check who subscribes.
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Newsletter signup failed:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
