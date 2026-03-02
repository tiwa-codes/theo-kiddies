import type { Product } from "@/types";

export function ProductStructuredData({ product }: { product: Product }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: `Shop ${product.title} – ${product.category} for ${product.ageGroup} children at Theo Kiddies.`,
    sku: product.id,
    brand: { "@type": "Brand", name: "Theo Kiddies" },
    offers: {
      "@type": "Offer",
      url: `https://theokiddies.com/product/${product.slug}`,
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Theo Kiddies" },
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
