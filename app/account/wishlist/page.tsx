"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { products as staticProducts } from "@/lib/data";
import { useWishlistStore } from "@/store/wishlist";

export default function AccountWishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const items = staticProducts.filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <Container size="wide" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">My Account</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <Card className="p-10 text-center">
            <Heart className="mx-auto h-9 w-9 text-brand-orange/50" />
            <p className="mt-3 font-semibold text-brand-cocoa">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-brand-cocoa/70">Tap the heart icon on any product to save it here.</p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white">
              Browse products
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-square bg-brand-cream">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-brand-cocoa">{item.title}</p>
                    <p className="mt-1 text-sm text-brand-cocoa/70">₦{item.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
