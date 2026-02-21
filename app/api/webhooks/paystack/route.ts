import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

// This endpoint receives Paystack webhook events.
// Set the webhook URL in your Paystack Dashboard →
// Settings → API Keys & Webhooks → Webhook URL
// URL: https://your-domain.com/api/webhooks/paystack
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // Verify signature to ensure the request is from Paystack
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Handle the events you care about
    if (event.event === "charge.success") {
      const { reference, amount, customer, metadata } = event.data;

      // TODO: Save this order to your database
      // Example with Supabase:
      //   await supabase.from("orders").insert({
      //     reference,
      //     amount: amount / 100,
      //     email: customer.email,
      //     items: metadata?.custom_fields ?? [],
      //     status: "paid",
      //   });

      console.log("✅ Payment successful:", {
        reference,
        amount: amount / 100,
        email: customer.email,
        items: metadata?.custom_fields,
      });
    }

    // Always return 200 so Paystack stops retrying
    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
