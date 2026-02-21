import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-cream">
      {/* Decorative floating blobs */}
      <span className="pointer-events-none absolute -top-10 left-[10%] h-40 w-40 rounded-full bg-accent-apricot/50 blur-3xl float-shape" />
      <span className="pointer-events-none absolute right-[5%] top-20 h-32 w-32 rounded-full bg-accent-sky/60 blur-2xl float-shape-slow" />
      <span className="pointer-events-none absolute bottom-0 left-[40%] h-24 w-24 rounded-full bg-accent-mint/50 blur-2xl float-shape-delay" />

      <Container size="wide" className="grid gap-10 py-16 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange/70 [animation-delay:0ms]">
            New season essentials
          </p>
          <h1 className="animate-fade-up text-4xl font-bold text-brand-cocoa sm:text-5xl lg:text-6xl [animation-delay:100ms]">
            Soft, playful styles for every little adventure.
          </h1>
          <p className="animate-fade-up max-w-xl text-base text-brand-cocoa/70 sm:text-lg [animation-delay:200ms]">
            Theo Kiddies brings together premium kidswear, shoes, toys, and school supplies with a warm,
            trustworthy experience parents can rely on.
          </p>
          <div className="animate-fade-up flex flex-wrap gap-3 [animation-delay:300ms]">
            <Button size="lg">Shop Now</Button>
            <Button size="lg" variant="secondary">
              Explore Deals
            </Button>
          </div>
          <div className="animate-fade-up flex flex-wrap gap-4 text-sm text-brand-cocoa/70 [animation-delay:400ms]">
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">30-day easy returns</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">Secure checkout</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-soft">Nationwide delivery</span>
          </div>
        </div>

        <div className="animate-fade-up relative [animation-delay:200ms]">
          <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-accent-mint blur-2xl float-shape" />
          <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-accent-sky blur-2xl float-shape-slow" />
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-float">
            <Image
              src="/images/hero-kids.svg"
              alt="Happy kids with Theo Kiddies essentials"
              width={640}
              height={520}
              className="h-full w-full rounded-2xl object-cover"
              priority
            />
            <div className="absolute bottom-6 left-6 animate-fade-up rounded-2xl bg-white/90 p-4 shadow-soft [animation-delay:600ms]">
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
