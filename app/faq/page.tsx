import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQs – Theo Kiddies",
  description: "Frequently asked questions about shopping, delivery, and returns at Theo Kiddies.",
};

const faqs = [
  {
    title: "How long does delivery take?",
    content:
      "We dispatch all orders within 1–2 business days. Standard nationwide delivery takes 2–5 business days depending on your location. Lagos and Abuja orders typically arrive faster.",
  },
  {
    title: "Do you deliver nationwide?",
    content:
      "Yes! We deliver to all 36 states and the FCT. Delivery fees are calculated at checkout based on your location.",
  },
  {
    title: "What payment methods do you accept?",
    content:
      "We accept all major debit and credit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments — all securely processed by Paystack.",
  },
  {
    title: "Can I return an item?",
    content:
      "Yes. We accept returns within 7 days of delivery for unworn, unwashed items in their original packaging. Contact us via WhatsApp or email to initiate a return.",
  },
  {
    title: "How do I track my order?",
    content:
      "Once your order is dispatched, you'll receive a tracking number via email. You can also contact us on WhatsApp with your order reference for updates.",
  },
  {
    title: "Are the sizes true to size?",
    content:
      "Yes, most items are true to size. We recommend checking our Size Guide page for measurements. For layered or outerwear items, sizing up is usually a good idea.",
  },
  {
    title: "Do you offer gift wrapping?",
    content:
      "Yes! Add a gift wrap note at checkout. We'll wrap your items neatly and include your personalised message.",
  },
  {
    title: "How do I contact customer support?",
    content:
      "You can reach us via WhatsApp (fastest), email at hello@theokiddies.com, or through our social media pages. We respond within 24 hours on business days.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Help Centre
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Frequently Asked Questions</h1>
          <p className="mt-3 max-w-xl text-sm text-brand-cocoa/70">
            Can&apos;t find your answer? Message us on WhatsApp — we&apos;re happy to help.
          </p>
        </div>
        <div className="max-w-2xl">
          <Accordion items={faqs} />
        </div>
      </Container>
    </div>
  );
}
