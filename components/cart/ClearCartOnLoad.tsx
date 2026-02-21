"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/** Clears the cart once mounted — used on the order-confirmation page. */
export function ClearCartOnLoad() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
