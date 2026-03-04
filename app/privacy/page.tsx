import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy – Theo Kiddies",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Privacy Policy</h1>
          <p className="mt-2 text-sm text-brand-cocoa/60">Last updated: March 2026</p>
        </div>
        <div className="max-w-2xl space-y-6 text-sm text-brand-cocoa/70 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-brand-cocoa [&_h2]:mb-2">
          <div>
            <h2>Information We Collect</h2>
            <p>We collect your name, email address, shipping address, and payment details when you place an order. Payment information is processed securely by Paystack and is never stored on our servers.</p>
          </div>
          <div>
            <h2>How We Use Your Information</h2>
            <p>Your information is used to process orders, send order confirmations and shipping updates, and improve our service. We do not sell or share your personal data with third parties.</p>
          </div>
          <div>
            <h2>Cookies</h2>
            <p>We use cookies to maintain your shopping cart and analyse site traffic. You can disable cookies in your browser settings, though this may affect site functionality.</p>
          </div>
          <div>
            <h2>Data Retention</h2>
            <p>Order data is retained for 2 years for legal and accounting purposes. You may request deletion of your personal data at any time by emailing hello@theokiddies.com.</p>
          </div>
          <div>
            <h2>Contact</h2>
            <p>For any privacy concerns, email us at hello@theokiddies.com.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
