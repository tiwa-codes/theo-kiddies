import type { Currency } from "@/store/currency";

/** Approximate exchange rates: 1 NGN = x foreign currency */
export const RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1650,
  GBP: 1 / 2100,
  EUR: 1 / 1800,
};

export const SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export const LOCALES: Record<Currency, string> = {
  NGN: "en-NG",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
};

/** Convert a NGN price to the given currency and format it */
export function formatPrice(ngnAmount: number, currency: Currency): string {
  const converted = ngnAmount * RATES[currency];
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(converted);
}
