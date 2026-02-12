import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <Container size="wide" className="grid gap-10 py-16 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange/70">
            New season essentials
          </p>
          <h1 className="text-4xl font-bold text-brand-cocoa sm:text-5xl lg:text-6xl">
            Soft, playful styles for every little adventure.
          </h1>
          <p className="max-w-xl text-base text-brand-cocoa/70 sm:text-lg">
            Theo Kiddies brings together premium kidswear, shoes, toys, and school supplies with a warm,
            trustworthy experience parents can rely on.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Shop Now</Button>
            <Button size="lg" variant="secondary">
              Explore Deals
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-brand-cocoa/70">
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">30-day easy returns</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">Secure checkout</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">Nationwide delivery</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-accent-mint blur-2xl" />
          <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-accent-sky blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-float">
            <Image
              src="/images/hero-kids.svg"
              alt="Happy kids with Theo Kiddies essentials"
              width={640}
              height={520}
              className="h-full w-full rounded-2xl object-cover"
              priority
            />
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Limited time
              </p>
              <p className="text-lg font-semibold text-brand-cocoa">Back-to-school bundles</p>
              <Link href="/category/school-supplies" className="text-sm font-semibold text-brand-orange">
                Shop bundles
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
