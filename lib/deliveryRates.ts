/**
 * Supabase-backed lookup of active delivery rates. Kept separate from
 * lib/delivery.ts, which stays a pure function with no network calls —
 * used by both the checkout API and the quote endpoint.
 */
import { supabase } from "@/lib/supabase";
import type { DeliveryRate } from "@/lib/delivery";

export async function getActiveDeliveryRates(): Promise<DeliveryRate[]> {
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
