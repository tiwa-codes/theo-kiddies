import { InvalidCartError, parseRequestedItems, priceOrder } from "@/lib/checkout";
import { getProductsBySlugs } from "@/lib/products";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: unknown; email?: unknown };

    if (!isValidEmail(body.email)) {
      return Response.json({ error: "A valid email address is required" }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();

    // The browser tells us WHAT and HOW MANY. It does not get to say what it costs.
    const requested = parseRequestedItems(body.items);
    const catalog = await getProductsBySlugs(requested.map((item) => item.slug));
    const priced = priceOrder(requested, catalog);

    if (!priced.ok) {
      return Response.json({ error: priced.error }, { status: 409 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

    const res = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: priced.amountKobo,
        currency: process.env.PAYSTACK_CURRENCY ?? "NGN",
        callback_url: `${baseUrl}/order-confirmation`,
        metadata: {
          custom_fields: priced.lines.map((line) => ({
            display_name: line.title,
            variable_name: line.slug,
            value: [
              `Qty ${line.quantity}`,
              line.size ? `Size ${line.size}` : null,
              line.color ? `Colour ${line.color}` : null,
              `₦${line.lineTotal.toLocaleString("en-NG")}`,
            ]
              .filter(Boolean)
              .join(" · "),
          })),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      throw new Error(data.message ?? "Paystack initialization failed");
    }

    return Response.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
      // Echoed back so the client can show the authoritative total if it wants to.
      subtotal: priced.subtotalNaira,
    });
  } catch (err: unknown) {
    if (err instanceof InvalidCartError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    console.error("Checkout error:", err);
    return Response.json(
      { error: "We couldn't start your payment. Please try again." },
      { status: 500 }
    );
  }
}
