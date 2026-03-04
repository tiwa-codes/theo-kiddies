import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms & Conditions – Theo Kiddies",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-brand-cocoa/60">Last updated: March 2026</p>
        </div>
        <div className="max-w-2xl space-y-6 text-sm text-brand-cocoa/70 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-brand-cocoa [&_h2]:mb-2">
          <div>
            <h2>Use of the Site</h2>
            <p>By using this site you agree to shop responsibly and not misuse our platform. Theo Kiddies reserves the right to cancel orders that violate these terms.</p>
          </div>
          <div>
            <h2>Product Descriptions</h2>
            <p>We make every effort to display products accurately. Colours may vary slightly due to monitor settings. If an item significantly differs from its description, contact us for a resolution.</p>
          </div>
          <div>
            <h2>Pricing</h2>
            <p>All prices are in Nigerian Naira (₦) and include applicable taxes. We reserve the right to change prices at any time. Your order is confirmed at the price displayed at checkout.</p>
          </div>
          <div>
            <h2>Intellectual Property</h2>
            <p>All content on this site including images, text, and logos are the property of Theo Kiddies and may not be reproduced without permission.</p>
          </div>
          <div>
            <h2>Governing Law</h2>
            <p>These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be resolved under Nigerian jurisdiction.</p>
          </div>
          <div>
            <h2>Contact</h2>
            <p>Questions about these terms? Email hello@theokiddies.com.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
