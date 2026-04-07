import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/lib/config";

export function InstagramGrid() {
  const whatsappLink = `https://wa.me/${siteConfig.whatsapp}`;

  return (
    <section className="py-14">
      <Container>
        <div className="rounded-3xl border border-brand-orange/15 bg-brand-cream/70 px-6 py-10 sm:px-10">
          <SectionHeader
            title="Get featured"
            subtitle="Share your Theo Kiddies moments with #TheoKiddies for a chance to be featured on our page."
            align="center"
          />

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
            >
              Post on Instagram
            </Link>
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-cocoa ring-1 ring-brand-orange/20 transition hover:bg-brand-cream"
            >
              Send on WhatsApp
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-brand-cocoa/60">
            Tag us and use <span className="font-semibold text-brand-cocoa">#TheoKiddies</span>.
          </p>
        </div>
      </Container>
    </section>
  );
}
