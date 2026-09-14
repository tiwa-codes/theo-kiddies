import { supabase, escapeLikePattern } from "@/lib/supabase";
import { createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// This is what replaces customer accounts — anyone can call it with any
// reference/email pair, so it needs to be slow to brute-force.
const limiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = limiter.check(ip);
  if (!allowed) {
    return Response.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = (await req.json()) as { reference?: unknown; email?: unknown };

    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    if (!reference) {
      return Response.json({ error: "Please enter your order reference." }, { status: 400 });
    }
    if (!isValidEmail(body.email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();

    // Both must match in the same query — a correct reference with the
    // wrong email has to come back identical to a reference that doesn't
    // exist at all, or the response itself would leak which one was right.
    const { data, error } = await supabase
      .from("orders")
      .select(
        "reference, amount, currency, items, status, created_at, shipping_address, delivery_fee, delivery_status"
      )
      .ilike("reference", escapeLikePattern(reference))
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return Response.json(
        { error: "No order found for that reference and email." },
        { status: 404 }
      );
    }

    return Response.json({
      reference: data.reference,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      items: data.items,
      shippingAddress: data.shipping_address,
      deliveryFee: data.delivery_fee,
      deliveryStatus: data.delivery_status,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error("Order lookup error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
