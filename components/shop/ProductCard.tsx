"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Check } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const hasSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const isSaved = has(product.id);
  const [justAdded, setJustAdded] = useState(false);

  function handleQuickAdd() {
    addItem({
      id: `${product.id}-${product.colors[0]?.id ?? "default"}-${product.sizes[0]?.id ?? "default"}`,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0],
      color: product.colors[0]?.id,
      size: product.sizes[0]?.id,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float">
      {product.badge && (
        <Badge className="absolute left-4 top-4 z-10 animate-pop-in">{product.badge}</Badge>
      )}
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 shadow-soft transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
        aria-label="Add to wishlist"
        onClick={() => toggle(product.id)}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            isSaved ? "fill-brand-orange text-brand-orange" : "text-brand-orange"
          )}
        />
      </button>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-cream">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 768px) 70vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-orange/70">
            {product.category}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-brand-cocoa">
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>₦{product.price.toFixed(2)}</span>
          {hasSale && (
            <span className="text-xs text-brand-cocoa/50 line-through">
              ₦{product.compareAtPrice?.toFixed(2)}
            </span>
          )}
        </div>
        <Button
          variant={justAdded ? "primary" : "secondary"}
          className={cn(
            "w-full justify-between transition-all duration-300",
            justAdded && "scale-[0.97]"
          )}
          onClick={handleQuickAdd}
        >
          {justAdded ? (
            <>
              Added!
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Quick add
              <Plus className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
