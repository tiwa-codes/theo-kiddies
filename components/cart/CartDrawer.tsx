"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCartStore } from "@/store/cart";

const FREE_DELIVERY_THRESHOLD = 75;

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-brand-orange/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
              Your Cart
            </p>
            <h3 className="text-lg font-semibold text-brand-cocoa">
              {items.length} {items.length === 1 ? "item" : "items"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <div className="rounded-2xl bg-brand-cream p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Free delivery progress</span>
              <span>${remaining.toFixed(2)} to go</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-brand-orange transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-soft">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-brand-cream">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-cocoa">{item.title}</p>
                    <p className="text-xs text-brand-cocoa/60">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <QuantitySelector
                  value={item.quantity}
                  onChange={(value) => updateQuantity(item.id, value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-brand-orange/10 px-6 py-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs text-brand-cocoa/60">Taxes and shipping calculated at checkout.</p>
          <div className="mt-4">
            <Link
              href="/checkout"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
