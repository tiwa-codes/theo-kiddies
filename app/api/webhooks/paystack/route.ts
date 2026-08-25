import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

// Webhook URL to configure in:
// Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL
// → https://your-domain.com/api/webhooks/paystack
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // Verify signature to ensure the request is genuinely from Paystack
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, amount, currency, customer, metadata, paid_at } = event.data;
      const email: string = customer.email;
      const amountDecimal: number = amount / 100;
      const items = metadata?.custom_fields ?? [];

      // Set by app/api/checkout/route.ts under a single metadata key (not
      // custom_fields — see that route for why). Missing on any order that
      // predates this, or that didn't go through our own checkout API.
      const orderDetails = metadata?.order_details ?? null;
      const shippingAddress = orderDetails?.shipping_address ?? null;
      const deliveryFee: number =
        typeof orderDetails?.delivery_fee === "number" ? orderDetails.delivery_fee : 0;
      const deliveryStatus: "quoted" | "to_be_quoted" =
        orderDetails?.delivery_status === "quoted" ? "quoted" : "to_be_quoted";
      const newsletterOptIn = Boolean(shippingAddress?.newsletterOptIn);
      // Paystack's own event timestamp, not `new Date()` — Paystack can
      // redeliver the same webhook, and the upsert below would otherwise
      // re-stamp consent with a fresh time on every redelivery.
      const newsletterOptInAt = newsletterOptIn ? paid_at ?? new Date().toISOString() : null;

      // 1. Save order to Supabase (ignore duplicate references)
      const { error: orderError } = await supabase.from("orders").upsert(
        {
          reference,
          amount: amountDecimal,
          currency: currency ?? "NGN",
          email,
          items,
          status: "paid",
          shipping_address: shippingAddress,
          delivery_fee: deliveryFee,
          delivery_status: deliveryStatus,
          newsletter_opt_in: newsletterOptIn,
          newsletter_opt_in_at: newsletterOptInAt,
        },
        { onConflict: "reference" }
      );

      if (orderError) {
        console.error("Supabase order save error:", orderError);
      }

      // 2. Upsert customer record (increment order_count + total_spent)
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("order_count, total_spent")
        .eq("email", email)
        .maybeSingle();

      if (existingCustomer) {
        await supabase
          .from("customers")
          .update({
            order_count: existingCustomer.order_count + 1,
            total_spent: existingCustomer.total_spent + amountDecimal,
            last_seen: new Date().toISOString(),
          })
          .eq("email", email);
      } else {
        await supabase.from("customers").insert({
          email,
          order_count: 1,
          total_spent: amountDecimal,
        });
      }

      // 3. Send order confirmation email via Resend
      await sendOrderConfirmation({
        email,
        reference,
        amount: amountDecimal,
        currency: currency ?? "NGN",
        items,
        shippingAddress,
        deliveryFee,
        deliveryStatus,
      });

      console.log("✅ Order saved + email sent:", { reference, email, amount: amountDecimal });
    }

    // Always return 200 so Paystack stops retrying
    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
