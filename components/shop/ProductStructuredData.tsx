import type { Product } from "@/types";

export function ProductStructuredData({ product }: { product: Product }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: "Premium kids essentials from Theo Kiddies.",
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
