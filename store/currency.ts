import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "NGN" | "USD" | "GBP" | "EUR";

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "NGN",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "theo-currency" }
  )
);
