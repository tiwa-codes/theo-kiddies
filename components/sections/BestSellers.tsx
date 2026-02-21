import { products } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";

export function BestSellers() {
  return (
    <section className="py-14">
      <Container>
        <FadeIn>
          <SectionHeader
            title="Best sellers"
            subtitle="Customer favorites that deliver comfort, quality, and smiles."
          />
        </FadeIn>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 sm:overflow-visible snap-x snap-mandatory">
          {products.slice(0, 4).map((product, i) => (
            <FadeIn key={product.id} delay={i * 80} className="min-w-[240px] snap-start sm:min-w-0">
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
