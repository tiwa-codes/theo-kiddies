import {
  InvalidCartError,
  parseRequestedItems,
  parseShippingAddress,
  priceOrder,
} from "@/lib/checkout";
import { calculateDeliveryFee, type DeliveryRate } from "@/lib/delivery";
import { getProductsBySlugs } from "@/lib/products";
import { supabase } from "@/lib/supabase";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";

/**
 * Active delivery rates, looked up server-side — never trust a fee the
 * client claims. No logistics partner is chosen yet, so today this is
 * always empty and every order comes back to_be_quoted; see lib/delivery.ts.
 */
async function getActiveDeliveryRates(): Promise<DeliveryRate[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const { data, error } = await supabase
    .from("delivery_rates")
    .select("state, fee, active")
    .eq("active", true);
  if (error) throw error;

  return (data ?? []).map((row: { state: string; fee: number; active: boolean }) => ({
    state: row.state,
    fee: Number(row.fee),
    active: Boolean(row.active),
  }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: unknown; address?: unknown };

    // The browser tells us WHAT it wants, HOW MANY, and WHERE to send it.
    // It does not get to say what any of that costs.
    const address = parseShippingAddress(body.address);
    const requested = parseRequestedItems(body.items);
    const catalog = await getProductsBySlugs(requested.map((item) => item.slug));
    const priced = priceOrder(requested, catalog);

    if (!priced.ok) {
      return Response.json({ error: priced.error }, { status: 409 });
    }

    const rates = await getActiveDeliveryRates();
    const delivery = calculateDeliveryFee({
      state: address.state,
      subtotalNaira: priced.subtotalNaira,
      rates,
    });
    const amountKobo = priced.amountKobo + Math.round(delivery.fee * 100);

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

    const res = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: address.email,
        amount: amountKobo,
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
          // A single key, not custom_fields — custom_fields is for short
          // display strings and has a size ceiling; the webhook reads the
          // full address back out of here to persist it on the order.
          order_details: {
            shipping_address: address,
            delivery_fee: delivery.fee,
            delivery_status: delivery.status,
          },
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
      // Echoed back so the client can show the authoritative total before payment.
      subtotal: priced.subtotalNaira,
      deliveryFee: delivery.fee,
      deliveryStatus: delivery.status,
      deliveryMessage: delivery.message,
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
