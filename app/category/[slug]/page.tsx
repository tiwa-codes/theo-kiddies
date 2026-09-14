import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryToolbar } from "@/components/filters/CategoryToolbar";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";
import { queryProducts, type ProductFilters } from "@/lib/products";

// Without this, Next's fetch cache serves stale results — a product's
// published/in-stock/price change wouldn't show up until something else
// happened to invalidate the cache. Found while verifying 2.2.
export const dynamic = "force-dynamic";

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
  page?: string;
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const title = categoryMap[params.slug];
  if (!title) return notFound();

  // --- Base filter by slug, plus everything from the toolbar/sidebar,
  // pushed into the query rather than fetched-then-filtered in memory. ---
  const filters: ProductFilters = {
    page: Number(searchParams.page) > 0 ? Number(searchParams.page) : 1,
  };

  if (ageGroupMap[params.slug]) {
    filters.ageGroup = ageGroupMap[params.slug];
  } else if (categoryNameMap[params.slug]) {
    filters.category = categoryNameMap[params.slug];
  } else if (params.slug === "best-sellers") {
    filters.badge = "Best Seller";
  } else if (params.slug === "new-arrivals") {
    filters.badge = "New";
  } else if (params.slug === "deals") {
    filters.onSale = true;
  }
  // gift-ideas — show all

  // "|" not "," — the price band labels contain commas themselves
  // (e.g. "₦30,000+"), which collides with "," as the multi-select
  // delimiter. See FilterSidebar.tsx / CategoryToolbar.tsx.
  if (searchParams.age) filters.ages = searchParams.age.split("|");
  if (searchParams.price) filters.priceBands = searchParams.price.split("|");
  if (searchParams.availability) {
    const avail = searchParams.availability.split("|");
    if (avail.includes("In stock") && !avail.includes("Pre-order")) {
      filters.inStockOnly = true;
    }
  }
  if (searchParams.sort === "price-asc" || searchParams.sort === "price-desc" || searchParams.sort === "newest") {
    filters.sort = searchParams.sort;
  }

  const result = await queryProducts(filters);

  // Size isn't pushed into the query — sizes is a JSONB array of
  // {id, label} objects, and PostgREST can't express "any element's label
  // matches one of several values" without a raw SQL function. Applied
  // within the current page only; see lib/products.ts for the tradeoff.
  let products = result.products;
  if (searchParams.size) {
    const sizes = searchParams.size.split("|").map((s) => s.toLowerCase());
    products = products.filter((p) => p.sizes.some((s) => sizes.includes(s.label.toLowerCase())));
  }

  function pageHref(page: number) {
    const qs = new URLSearchParams();
    if (searchParams.age) qs.set("age", searchParams.age);
    if (searchParams.size) qs.set("size", searchParams.size);
    if (searchParams.price) qs.set("price", searchParams.price);
    if (searchParams.availability) qs.set("availability", searchParams.availability);
    if (searchParams.sort) qs.set("sort", searchParams.sort);
    if (page > 1) qs.set("page", String(page));
    const query = qs.toString();
    return `/category/${params.slug}${query ? `?${query}` : ""}`;
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
            {products.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
                <p className="font-semibold text-brand-cocoa">No products match your filters.</p>
                <p className="mt-1 text-sm text-brand-cocoa/60">Try adjusting or clearing the active filters.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-brand-cocoa/60">
                  {result.total} {result.total === 1 ? "product" : "products"}
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {result.totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-8 flex items-center justify-center gap-2"
                  >
                    <Link
                      href={pageHref(Math.max(1, result.page - 1))}
                      aria-disabled={result.page <= 1}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        result.page <= 1
                          ? "pointer-events-none border-gray-200 text-gray-300"
                          : "border-brand-orange/20 text-brand-cocoa hover:border-brand-orange/40"
                      }`}
                    >
                      Previous
                    </Link>
                    <span className="text-sm text-brand-cocoa/60">
                      Page {result.page} of {result.totalPages}
                    </span>
                    <Link
                      href={pageHref(Math.min(result.totalPages, result.page + 1))}
                      aria-disabled={result.page >= result.totalPages}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        result.page >= result.totalPages
                          ? "pointer-events-none border-gray-200 text-gray-300"
                          : "border-brand-orange/20 text-brand-cocoa hover:border-brand-orange/40"
                      }`}
                    >
                      Next
                    </Link>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
