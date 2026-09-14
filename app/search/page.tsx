import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";
import { searchProducts } from "@/lib/products";

// Results must reflect live data — Next's fetch cache otherwise caches the
// Supabase client's underlying requests across different search terms.
export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Metadata {
  const q = searchParams.q?.trim();
  return { title: q ? `"${q}" – Search results` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="bg-brand-cream py-10">
      <Container size="wide" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Theo Kiddies
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
        </div>

        {!query ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
            <Search className="mx-auto h-8 w-8 text-brand-orange/40" />
            <p className="mt-3 font-semibold text-brand-cocoa">
              Enter a search term to find products.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
            <p className="font-semibold text-brand-cocoa">
              No products match &quot;{query}&quot;.
            </p>
            <p className="mt-1 text-sm text-brand-cocoa/60">
              Try a different search term, or browse by category instead.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-brand-cocoa/60">
              {results.length} {results.length === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
