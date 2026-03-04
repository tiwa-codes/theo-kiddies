"use client";

import { useCurrencyStore, type Currency } from "@/store/currency";
import { SYMBOLS } from "@/lib/currency";

const OPTIONS: { value: Currency; label: string }[] = [
  { value: "NGN", label: "₦ NGN" },
  { value: "USD", label: "$ USD" },
  { value: "GBP", label: "£ GBP" },
  { value: "EUR", label: "€ EUR" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <select
      aria-label="Select currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="rounded-full border border-brand-orange/10 bg-transparent px-3 py-1.5 text-xs font-semibold text-brand-cocoa focus:outline-none hover:border-brand-orange/30 transition cursor-pointer"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
