/**
 * Naira formatting — the only currency Theo Kiddies charges in. A
 * multi-currency selector used to live here, converting via hardcoded
 * exchange rates that drifted from reality while checkout always charged
 * in ₦ regardless of what was displayed. Removed rather than labelled
 * "approximate" — simpler to be correct than to caveat being wrong.
 */
export function formatPrice(ngnAmount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ngnAmount);
}
