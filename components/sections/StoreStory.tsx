import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { storeStoryImages } from "@/lib/data";

export function StoreStory() {
  if (storeStoryImages.length === 0) return null;

  const [featured, ...gallery] = storeStoryImages;

  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Our Store Story"
          subtitle="A look inside our physical store where parents and kids discover everyday essentials with ease."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <FadeIn className="overflow-hidden rounded-2xl bg-brand-cream">
            <div className="relative aspect-[4/3]">
              <Image src={featured.src} alt={featured.alt} fill className="object-cover" />
            </div>
          </FadeIn>

          <div className="space-y-5">
            <FadeIn className="rounded-2xl border border-brand-orange/15 bg-white p-5">
              <h3 className="text-lg font-semibold text-brand-cocoa">Built for real family shopping</h3>
              <p className="mt-2 text-sm text-brand-cocoa/70">
                From baby basics to school-day essentials, every section is arranged to help you find what you need quickly.
              </p>
              <Link href="/category/new-arrivals" className="mt-4 inline-flex text-sm font-semibold text-brand-orange">
                Explore new arrivals
              </Link>
            </FadeIn>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery.slice(0, 6).map((image, index) => (
                <FadeIn
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream"
                  delay={index * 60}
                >
                  <Image src={image.src} alt={image.alt} fill className="object-cover" />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
