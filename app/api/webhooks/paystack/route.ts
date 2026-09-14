import crypto from "crypto";
import { supabase, type OrderItem, type OrderLineItem } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

// Webhook URL to configure in:
// Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL
// → https://your-domain.com/api/webhooks/paystack
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // Verify signature to ensure the request is genuinely from Paystack.
    // timingSafeEqual, not !== — a string comparison short-circuits on the
    // first mismatched byte, leaking (via response timing) how many bytes
    // of a guessed signature were correct so far.
    const expectedHash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    const validSignature =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!validSignature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference } = event.data;

      // app/api/checkout/route.ts writes the full order row itself — items,
      // address, delivery info — before Paystack ever sees this reference.
      // That row is the source of truth; this webhook's only job is to flip
      // it to 'paid'. Paystack's own event data isn't used for anything else.
      //
      // .neq("status", "paid") makes this only match a genuine pending →
      // paid transition — Paystack can and does redeliver webhooks, and
      // without this guard a redelivery would re-decrement stock (double-
      // counting one sale) and re-send the confirmation email below.
      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("reference", reference)
        .neq("status", "paid")
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("Failed to mark order paid:", updateError);
        return Response.json({ received: true });
      }
      if (!order) {
        // No row matched — either no such reference at all, or it was
        // already paid (a redelivery, which is normal and not worth
        // logging). Only the first case is a genuine anomaly.
        const { data: existing } = await supabase
          .from("orders")
          .select("id")
          .eq("reference", reference)
          .maybeSingle();
        if (!existing) {
          console.error("Webhook for a reference with no matching order:", reference);
        }
        return Response.json({ received: true });
      }

      // Decrement stock per line item, atomically per product via the SQL
      // function so two webhooks for the same product's last unit can't
      // both succeed — a plain read-then-write from here would have a
      // race window. Best-effort beyond that: the weekly Prokip re-import
      // corrects any drift, so this doesn't need to be perfect, just safe
      // against a double sale.
      const quantityByProduct = new Map<string, number>();
      for (const item of (order.items ?? []) as OrderLineItem[]) {
        quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
      }
      for (const [productId, quantity] of quantityByProduct) {
        const { error: stockError } = await supabase.rpc("decrement_product_stock", {
          p_id: productId,
          qty: quantity,
        });
        if (stockError) {
          console.error("Failed to decrement stock for product", productId, stockError);
        }
      }

      // Upsert customer record (increment order_count + total_spent)
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("order_count, total_spent")
        .eq("email", order.email)
        .maybeSingle();

      if (existingCustomer) {
        await supabase
          .from("customers")
          .update({
            order_count: existingCustomer.order_count + 1,
            total_spent: existingCustomer.total_spent + order.amount,
            last_seen: new Date().toISOString(),
          })
          .eq("email", order.email);
      } else {
        await supabase.from("customers").insert({
          email: order.email,
          order_count: 1,
          total_spent: order.amount,
        });
      }

      // Confirmation email — display strings derived from our own
      // structured line items, not from anything Paystack echoed back.
      const emailItems: OrderItem[] = ((order.items ?? []) as OrderLineItem[]).map((item) => ({
        display_name: item.title,
        variable_name: item.slug,
        value: [
          `Qty ${item.quantity}`,
          item.size ? `Size ${item.size}` : null,
          item.color ? `Colour ${item.color}` : null,
          `₦${item.lineTotal.toLocaleString("en-NG")}`,
        ]
          .filter(Boolean)
          .join(" · "),
      }));

      await sendOrderConfirmation({
        email: order.email,
        reference: order.reference,
        amount: order.amount,
        currency: order.currency,
        items: emailItems,
        shippingAddress: order.shipping_address,
        deliveryFee: order.delivery_fee,
        deliveryStatus: order.delivery_status,
      });

      console.log("✅ Order marked paid + email sent:", { reference, email: order.email });
    }

    // Always return 200 so Paystack stops retrying
    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
