import Image from "next/image";
import { instagramImages } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function InstagramGrid() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Theo Kiddies in the wild"
          subtitle="Share your moments with #TheoKiddies for a chance to be featured."
          align="center"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instagramImages.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl bg-brand-cream">
              <Image src={image.src} alt="Theo Kiddies Instagram" fill className="object-cover" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
