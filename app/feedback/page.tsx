import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Mail, MessageCircle, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { buttonClassName } from "@/components/ui/buttonStyles";
import { NewsletterSignup } from "@/components/shop/NewsletterSignup";
import { readSiteContent } from "@/lib/site-content";
import { feedbackLinks, getFeedbackContacts } from "@/lib/feedback";
import { SOCIAL_HANDLE, socialLinks } from "@/lib/socials";

// Read the contacts on every visit so admin changes apply immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share your feedback – Theo Kiddies",
  description: "Tell us how your Theo Kiddies order went.",
  robots: { index: false, follow: false },
};

/** A loose cluster of pastel dots, like the ones on the printed thank-you card. */
function Dots({ className }: { className?: string }) {
  const dots = [
    "left-0 top-1 h-2.5 w-2.5 bg-accent-sky",
    "left-3.5 top-0 h-2 w-2 bg-brand-gold/70",
    "left-1.5 top-4 h-3 w-3 bg-accent-sage",
    "left-5 top-3.5 h-2.5 w-2.5 bg-accent-apricot",
    "left-0.5 top-8 h-2 w-2 bg-brand-cocoa/20",
    "left-4 top-7 h-2.5 w-2.5 bg-accent-sky",
  ];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute h-10 w-8 ${className ?? ""}`}>
      {dots.map((d) => (
        <span key={d} className={`absolute rounded-full ${d}`} />
      ))}
    </div>
  );
}

const cardClass = "rounded-2xl bg-white p-6 shadow-soft";

/**
 * Landing page for the QR code on the printed thank-you card. The printed URL
 * never changes; where the feedback buttons go is set in Admin → Settings.
 * Feedback comes first (it's why they scanned); shopping again, socials and
 * the newsletter follow.
 */
export default async function FeedbackPage() {
  const { whatsappUrl, emailUrl } = feedbackLinks(await getFeedbackContacts(readSiteContent));

  return (
    <div className="relative overflow-hidden bg-brand-cream py-12 sm:py-16">
      <Dots className="left-[6%] top-3 float-shape-slow sm:left-[10%] sm:top-16" />
      <Dots className="right-[9%] top-48 hidden float-shape-delay sm:block" />
      <Star
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-4 h-7 w-7 fill-accent-apricot text-accent-apricot float-shape sm:right-[16%] sm:top-12 sm:h-9 sm:w-9"
      />
      <Heart
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute bottom-28 left-[9%] hidden h-8 w-8 text-brand-gold float-shape-slow sm:block"
      />

      <Container>
        <div className="relative mx-auto max-w-xl">
          <FadeIn className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-orange">Thank you for your order</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-brand-cocoa sm:text-5xl">How did we do?</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-brand-cocoa/70">
              We read every message. Tell us what you loved, or what we could do better.
            </p>
          </FadeIn>

          <FadeIn delay={80} className="mt-8 flex flex-col gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ size: "lg", className: "w-full gap-2" })}
            >
              <MessageCircle className="h-5 w-5" />
              Send feedback on WhatsApp
            </a>
            <a href={emailUrl} className={buttonClassName({ variant: "secondary", size: "lg", className: "w-full gap-2" })}>
              <Mail className="h-5 w-5" />
              Send feedback by email
            </a>
          </FadeIn>

          <div className="my-10 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-brand-orange/15" />
            <Heart className="h-4 w-4 fill-brand-gold/30 text-brand-gold" />
            <span className="h-px flex-1 bg-brand-orange/15" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FadeIn delay={120} className={cardClass}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-apricot">
                <ShoppingBag className="h-5 w-5 text-brand-orange" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-brand-cocoa">Ready for the next one?</h2>
              <p className="mt-1 text-sm text-brand-cocoa/70">New pieces arrive all the time. Come and see what&apos;s new.</p>
              <Link href="/" className={buttonClassName({ variant: "secondary", className: "mt-5 w-full" })}>
                Shop again
              </Link>
            </FadeIn>

            <FadeIn delay={180} className={cardClass}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-sky">
                <Sparkles className="h-5 w-5 text-brand-cocoa" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-brand-cocoa">Follow {SOCIAL_HANDLE}</h2>
              <p className="mt-1 text-sm text-brand-cocoa/70">See new arrivals as they land.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map(({ name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Theo Kiddies on ${name}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-cream px-3.5 py-2 text-sm font-semibold text-brand-cocoa transition hover:bg-brand-orange hover:text-white"
                  >
                    <SocialIcon name={name} className="h-4 w-4" />
                    {name}
                  </a>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={240} className={`relative mt-4 overflow-hidden sm:p-8 ${cardClass}`}>
            <Dots className="right-6 top-6" />
            <h2 className="pr-10 text-lg font-semibold text-brand-cocoa">Join the Theo Kiddies family</h2>
            <p className="mt-1 max-w-sm text-sm text-brand-cocoa/70">New arrivals and offers, straight to your inbox.</p>
            <div className="mt-5">
              <NewsletterSignup source="feedback" />
            </div>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}
