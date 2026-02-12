import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="py-12">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-brand-orange text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#fff7ef,_transparent_60%)]" />
          </div>
          <div className="relative grid gap-6 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Seasonal offer</p>
              <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                Save 25% on cozy layers and school-ready sets.
              </h3>
              <p className="mt-3 text-sm text-white/80">
                Bundle up with warm knits, soft tees, and sturdy shoes curated for busy mornings.
              </p>
            </div>
            <div className="flex flex-col items-start justify-center gap-3 sm:flex-row sm:items-center">
              <Button className="bg-white text-brand-orange hover:bg-brand-cream">Shop the sale</Button>
              <Link href="/category/deals" className="text-sm font-semibold underline">
                Explore deals
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
