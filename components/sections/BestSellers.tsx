import { products } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";

export function BestSellers() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Best sellers"
          subtitle="Customer favorites that deliver comfort, quality, and smiles."
        />
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 sm:overflow-visible snap-x snap-mandatory">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="min-w-[240px] snap-start sm:min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
