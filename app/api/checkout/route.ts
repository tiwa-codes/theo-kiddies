import type { CartItem } from "@/store/cart";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";

export async function POST(req: Request) {
  try {
    const { items, email }: { items: CartItem[]; email: string } = await req.json();

    if (!items?.length) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

    // Amount in kobo (₦1 = 100 kobo). Prices in data are treated as NGN.
    const amountKobo = items.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0
    );

    const body = {
      email,
      amount: amountKobo,
      currency: process.env.PAYSTACK_CURRENCY ?? "NGN",
      callback_url: `${baseUrl}/order-confirmation`,
      metadata: {
        custom_fields: items.map((item) => ({
          display_name: item.title,
          variable_name: item.id,
          value: `Qty ${item.quantity} × ₦${item.price}`,
        })),
      },
    };

    const res = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      throw new Error(data.message ?? "Paystack initialization failed");
    }

    return Response.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout error";
    return Response.json({ error: message }, { status: 500 });
  }
}
