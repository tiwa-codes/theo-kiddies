"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const router = useRouter();
  const isSaved = has(product.id);

  function handleAdd() {
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  }

  function handleBuyNow() {
    handleAdd();
    router.push("/checkout");
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-soft">
      {product.colors.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Color
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  selectedColor === color.id
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-brand-orange/15 text-brand-cocoa hover:border-brand-orange/40"
                )}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Size
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSize(size.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  selectedSize === size.id
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-brand-orange/15 text-brand-cocoa hover:border-brand-orange/40"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-brand-cocoa/70">
        <ShieldCheck className="h-4 w-4 text-brand-orange" />
        {product.inStock ? "In stock" : "Out of stock"}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
          Quantity
        </p>
        <div className="mt-3">
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" onClick={handleAdd} disabled={!product.inStock}>
          Add to cart
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={!product.inStock}
        >
          Buy now
        </Button>
      </div>

      <a
        href="https://wa.me/15551234567"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-brand-cocoa transition hover:bg-brand-cream"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp inquiry
      </a>

      <button
        type="button"
        onClick={() => toggle(product.id)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-orange/15 py-2 text-sm font-semibold transition hover:bg-brand-cream"
      >
        <Heart
          className={cn(
            "h-4 w-4",
            isSaved ? "fill-brand-orange text-brand-orange" : "text-brand-orange"
          )}
        />
        {isSaved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    </div>
  );
}
