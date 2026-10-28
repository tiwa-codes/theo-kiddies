import type { Metadata } from "next";
import { MessageCircle, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/buttonStyles";
import { readSiteContent } from "@/lib/site-content";
import { feedbackLinks, getFeedbackContacts } from "@/lib/feedback";

// Read the contacts on every visit so admin changes apply immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share your feedback – Theo Kiddies",
  description: "Tell us how your Theo Kiddies order went.",
  robots: { index: false, follow: false },
};

/**
 * Landing page for the QR code on the printed thank-you card. The printed URL
 * never changes; where the two buttons go is set in Admin → Settings.
 */
export default async function FeedbackPage() {
  const { whatsappUrl, emailUrl } = feedbackLinks(await getFeedbackContacts(readSiteContent));

  return (
    <div className="min-h-[70vh] bg-brand-cream py-14">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">Thank you for your order</p>
          <h1 className="mt-3 text-3xl font-semibold text-brand-cocoa">How did we do?</h1>
          <p className="mt-3 text-sm text-brand-cocoa/70">
            We read every message. Tell us what you loved, or what we could do better.
          </p>

          <div className="mt-8 flex flex-col gap-3">
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
          </div>
        </div>
      </Container>
    </div>
  );
}
