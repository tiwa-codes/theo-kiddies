import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ProductCard({ product }: { product: Product }) {
  const hasSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Card className="group relative overflow-hidden">
      {product.badge && (
        <Badge className="absolute left-4 top-4 z-10">{product.badge}</Badge>
      )}
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 shadow-soft transition hover:bg-white"
        aria-label="Add to wishlist"
      >
        <Heart className="h-4 w-4 text-brand-orange" />
      </button>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-cream">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <span>${product.price.toFixed(2)}</span>
          {hasSale && (
            <span className="text-xs text-brand-cocoa/50 line-through">
              ${product.compareAtPrice?.toFixed(2)}
            </span>
          )}
        </div>
        <Button variant="secondary" className="w-full justify-between">
          Quick add
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
