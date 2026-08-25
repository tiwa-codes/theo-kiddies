/**
 * Delivery fee calculation. Pure function — no Supabase calls here, so it
 * stays trivially testable. The caller (checkout API) is responsible for
 * loading `rates` from the delivery_rates table.
 */
import { NIGERIAN_STATES } from "@/lib/nigeria";

export const FREE_DELIVERY_THRESHOLD_NAIRA = 150_000;

export type DeliveryRate = {
  state: string;
  fee: number;
  active: boolean;
};

export type DeliveryFeeResult = {
  fee: number;
  status: "quoted" | "to_be_quoted";
  message: string;
};

/**
 * Per-state flat delivery fee — a store policy, not a courier quote.
 * Unknown state throws: the checkout form's dropdown only ever sends a
 * NIGERIAN_STATES value, so one reaching here means the request was
 * tampered with, not that a legitimate state was missed.
 */
export function calculateDeliveryFee({
  state,
  subtotalNaira,
  rates,
}: {
  state: string;
  subtotalNaira: number;
  rates: DeliveryRate[];
}): DeliveryFeeResult {
  if (!(NIGERIAN_STATES as readonly string[]).includes(state)) {
    throw new Error(`"${state}" is not a recognised delivery state.`);
  }

  if (subtotalNaira >= FREE_DELIVERY_THRESHOLD_NAIRA) {
    return {
      fee: 0,
      status: "quoted",
      message: "Free delivery applied — your order qualifies for free nationwide delivery.",
    };
  }

  const rate = rates.find((r) => r.state === state);
  if (rate?.active) {
    return {
      fee: rate.fee,
      status: "quoted",
      message: `Delivery to ${state}: ₦${rate.fee.toLocaleString("en-NG")}.`,
    };
  }

  return {
    fee: 0,
    status: "to_be_quoted",
    message: `Delivery to ${state} will be confirmed on WhatsApp before dispatch.`,
  };
}
