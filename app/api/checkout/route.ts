import {
  InvalidCartError,
  parseRequestedItems,
  parseShippingAddress,
  priceOrder,
} from "@/lib/checkout";
import { calculateDeliveryFee } from "@/lib/delivery";
import { getActiveDeliveryRates } from "@/lib/deliveryRates";
import { getProductsBySlugs } from "@/lib/products";
import { supabase, type OrderLineItem } from "@/lib/supabase";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";

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
    const currency = process.env.PAYSTACK_CURRENCY ?? "NGN";

    // Our own reference, generated before Paystack ever sees this order —
    // it's what ties the eventual webhook back to the row written below.
    const reference = crypto.randomUUID();

    const catalogBySlug = new Map(catalog.map((product) => [product.slug, product]));
    const lineItems: OrderLineItem[] = priced.lines.map((line) => {
      const product = catalogBySlug.get(line.slug)!;
      return {
        productId: product.id,
        slug: line.slug,
        title: line.title,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        ...(line.color ? { color: line.color } : {}),
        ...(line.size ? { size: line.size } : {}),
      };
    });

    // Write the order ourselves, before Paystack — the webhook only flips
    // this row's status to 'paid'. Paystack's metadata carries a
    // reference, not our data: no size ceiling to hit, nothing to trust
    // an echo for.
    const { error: insertError } = await supabase.from("orders").insert({
      reference,
      amount: amountKobo / 100,
      currency,
      email: address.email,
      items: lineItems,
      status: "pending",
      shipping_address: address,
      delivery_fee: delivery.fee,
      delivery_status: delivery.status,
      newsletter_opt_in: address.newsletterOptIn,
      newsletter_opt_in_at: address.newsletterOptIn ? new Date().toISOString() : null,
    });
    if (insertError) throw insertError;

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
        currency,
        reference,
        callback_url: `${baseUrl}/order-confirmation`,
        metadata: {
          // Cosmetic only — shown on Paystack's own hosted checkout page,
          // never read back. The order row above is the source of truth.
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
      reference,
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
