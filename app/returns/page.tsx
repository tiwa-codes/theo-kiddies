import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Returns & Exchanges – Theo Kiddies",
  description: "Our return and exchange policy at Theo Kiddies.",
};

const sections = [
  {
    title: "Return Policy",
    content: [
      "Items may be returned within 7 days of delivery.",
      "Items must be unworn, unwashed, and in original packaging with all tags attached.",
      "Sale items and underwear/swimwear cannot be returned for hygiene reasons.",
      "To initiate a return, contact us via WhatsApp or email with your order reference number.",
    ],
  },
  {
    title: "Exchanges",
    content: [
      "We gladly exchange items for a different size or colour, subject to availability.",
      "Exchange requests must be made within 7 days of delivery.",
      "The customer covers return shipping costs. We cover the reshipping of the exchanged item.",
    ],
  },
  {
    title: "Refunds",
    content: [
      "Once we receive and inspect your return, we'll process a refund within 3–5 business days.",
      "Refunds are issued to the original payment method.",
      "Original shipping fees are non-refundable.",
    ],
  },
  {
    title: "Damaged or Wrong Items",
    content: [
      "If you received a damaged or incorrect item, please contact us within 48 hours of delivery.",
      "Send a photo of the item to hello@theokiddies.com or via WhatsApp.",
      "We'll arrange a replacement or full refund at no extra cost.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Policies
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Returns &amp; Exchanges</h1>
          <p className="mt-3 max-w-xl text-sm text-brand-cocoa/70">
            We want you to love every purchase. If something isn&apos;t right, here&apos;s how we&apos;ll make it right.
          </p>
        </div>
        <div className="max-w-2xl space-y-8">
          {sections.map(({ title, content }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-brand-cocoa">{title}</h2>
              <ul className="space-y-2">
                {content.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-brand-cocoa/70">
                    <span className="mt-0.5 text-brand-orange">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
