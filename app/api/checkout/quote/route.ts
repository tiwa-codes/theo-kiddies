import { calculateDeliveryFee } from "@/lib/delivery";
import { getActiveDeliveryRates } from "@/lib/deliveryRates";
import { NIGERIAN_STATES } from "@/lib/nigeria";

/**
 * Read-only delivery quote: no Paystack call, no order created. Lets the
 * checkout page show the real fee (or the to-be-quoted message) as soon as
 * the customer picks a state, instead of only finding out at payment time.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { state?: unknown; subtotalNaira?: unknown };

    const state = typeof body.state === "string" ? body.state.trim() : "";
    if (!(NIGERIAN_STATES as readonly string[]).includes(state)) {
      return Response.json({ error: "Please select a valid state." }, { status: 400 });
    }

    const subtotalNaira =
      typeof body.subtotalNaira === "number" && Number.isFinite(body.subtotalNaira)
        ? Math.max(0, body.subtotalNaira)
        : 0;

    const rates = await getActiveDeliveryRates();
    const delivery = calculateDeliveryFee({ state, subtotalNaira, rates });

    return Response.json(delivery);
  } catch (err) {
    console.error("Delivery quote error:", err);
    return Response.json({ error: "Could not calculate delivery fee." }, { status: 500 });
  }
}
