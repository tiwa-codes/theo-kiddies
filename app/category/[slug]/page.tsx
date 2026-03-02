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

const ageGroupMap: Record<string, string> = {
  "0-12-months": "0-12 Months",
  "1-3-years": "1-3 Years",
  "4-7-years": "4-7 Years",
  "8-12-years": "8-12 Years",
};

const categoryNameMap: Record<string, string> = {
  clothing: "Clothing",
  shoes: "Shoes",
  toys: "Toys",
  "school-supplies": "School Supplies",
  accessories: "Accessories",
  "baby-essentials": "Baby Essentials",
};

type SearchParams = {
  age?: string;
  size?: string;
  price?: string;
  availability?: string;
  sort?: string;
  q?: string;
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const title = categoryMap[params.slug];
  if (!title) return { title: "Category" };
  return {
    title: `${title} for Kids`,
    description: `Shop the best ${title.toLowerCase()} for children at Theo Kiddies. Premium quality with nationwide delivery across Nigeria.`,
    openGraph: {
      title: `${title} for Kids | Theo Kiddies`,
      description: `Discover premium ${title.toLowerCase()} for kids at Theo Kiddies. Fast nationwide delivery.`,
    },
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const title = categoryMap[params.slug];
  if (!title) return notFound();

  // --- Base filter by slug ---
  let filtered = [...products];
  if (ageGroupMap[params.slug]) {
    filtered = filtered.filter((p) => p.ageGroup === ageGroupMap[params.slug]);
  } else if (categoryNameMap[params.slug]) {
    filtered = filtered.filter((p) => p.category === categoryNameMap[params.slug]);
  } else if (params.slug === "best-sellers") {
    filtered = filtered.filter((p) => p.badge === "Best Seller");
  } else if (params.slug === "new-arrivals") {
    filtered = filtered.filter((p) => p.badge === "New");
  } else if (params.slug === "deals") {
    filtered = filtered.filter((p) => !!p.compareAtPrice);
  }
  // gift-ideas — show all

  // --- Search query ---
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  // --- Age filter ---
  if (searchParams.age) {
    const ages = searchParams.age.split(",");
    filtered = filtered.filter((p) => ages.includes(p.ageGroup));
  }

  // --- Size filter ---
  if (searchParams.size) {
    const sizes = searchParams.size.split(",").map((s) => s.toLowerCase());
    filtered = filtered.filter((p) =>
      p.sizes.some((s) => sizes.includes(s.label.toLowerCase()))
    );
  }

  // --- Price filter ---
  if (searchParams.price) {
    const ranges = searchParams.price.split(",");
    filtered = filtered.filter((p) =>
      ranges.some((range) => {
        if (range === "$0-$25") return p.price <= 25;
        if (range === "$25-$50") return p.price > 25 && p.price <= 50;
        if (range === "$50-$100") return p.price > 50 && p.price <= 100;
        if (range === "$100+") return p.price > 100;
        return true;
      })
    );
  }

  // --- Availability filter ---
  if (searchParams.availability) {
    const avail = searchParams.availability.split(",");
    if (avail.includes("In stock") && !avail.includes("Pre-order")) {
      filtered = filtered.filter((p) => p.inStock);
    }
  }

  // --- Sort ---
  if (searchParams.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (searchParams.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (searchParams.sort === "newest") {
    filtered.reverse();
  }

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
          <div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
                <p className="font-semibold text-brand-cocoa">No products match your filters.</p>
                <p className="mt-1 text-sm text-brand-cocoa/60">Try adjusting or clearing the active filters.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-brand-cocoa/60">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"}
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
