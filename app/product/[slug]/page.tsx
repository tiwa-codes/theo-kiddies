import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductStructuredData } from "@/components/shop/ProductStructuredData";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { products } from "@/lib/data";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = products.find((item) => item.slug === params.slug);
  if (!product) return { title: "Product" };
  return {
    title: product.title,
    description: `Shop ${product.title} at Theo Kiddies.`,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((item) => item.slug === params.slug);
  if (!product) return notFound();

  const hasSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="bg-brand-cream py-12">
      <Container size="wide" className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <ProductGallery images={product.images} title={product.title} />

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-brand-cocoa">{product.title}</h1>
              <div className="flex items-center gap-2 text-sm text-brand-cocoa/70">
                <div className="flex items-center gap-1 text-brand-orange">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-brand-orange" />
                  ))}
                </div>
                <span>{product.reviews} reviews</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-brand-cocoa">
              <span>${product.price.toFixed(2)}</span>
              {hasSale && (
                <span className="text-base text-brand-cocoa/50 line-through">
                  ${product.compareAtPrice?.toFixed(2)}
                </span>
              )}
              {product.badge && <Badge>{product.badge}</Badge>}
            </div>

            <AddToCartButton product={product} />

            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <p className="text-sm text-brand-cocoa/70">
                A premium set crafted with soft-touch fabrics and kid-friendly fits. Designed for everyday
                movement and cozy moments.
              </p>
              <div className="mt-6">
                <Accordion
                  items={[
                    {
                      title: "Size guide",
                      content:
                        "True to size with gentle stretch. For layered fits, choose one size up.",
                    },
                    {
                      title: "Shipping & returns",
                      content:
                        "Ships in 1-2 business days. Free returns within 30 days of delivery.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-cocoa">Related products</h2>
            <Link href="/category/best-sellers" className="text-sm font-semibold text-brand-orange">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </Container>
      <ProductStructuredData product={product} />
    </div>
  );
}
