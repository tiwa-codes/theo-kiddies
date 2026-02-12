import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryToolbar } from "@/components/filters/CategoryToolbar";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";
import { products } from "@/lib/data";

const categoryMap: Record<string, string> = {
  "0-12-months": "0-12 Months",
  "1-3-years": "1-3 Years",
  "4-7-years": "4-7 Years",
  "8-12-years": "8-12 Years",
  clothing: "Clothing",
  shoes: "Shoes",
  toys: "Toys",
  "school-supplies": "School Supplies",
  accessories: "Accessories",
  "baby-essentials": "Baby Essentials",
  "new-arrivals": "New Arrivals",
  "best-sellers": "Best Sellers",
  deals: "Deals",
  "gift-ideas": "Gift Ideas",
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const title = categoryMap[params.slug];
  if (!title) return { title: "Category" };

  return {
    title: `${title} Collection`,
    description: `Shop ${title.toLowerCase()} from Theo Kiddies.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const title = categoryMap[params.slug];
  if (!title) return notFound();

  return (
    <div className="bg-brand-cream py-10">
      <Container size="wide" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Theo Kiddies
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-cocoa/70">
            Curated picks for busy parents: cozy clothing, playful toys, and everyday essentials.
          </p>
        </div>

        <CategoryToolbar />

        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <FilterSidebar />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
