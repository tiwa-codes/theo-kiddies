import { BadgeCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const perks = [
  {
    title: "Secure Payments",
    note: "Trusted checkout partners and encrypted transactions.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Delivery Nationwide",
    note: "Reliable dispatch with real-time order updates.",
    icon: Truck,
  },
  {
    title: "Easy Returns",
    note: "Hassle-free exchanges within 30 days.",
    icon: RefreshCcw,
  },
  {
    title: "Quality Guaranteed",
    note: "Carefully vetted brands and materials.",
    icon: BadgeCheck,
  },
];

export function WhyShop() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Why shop with us"
          subtitle="Every detail is curated to make parenting easier, with calm and confidence."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk) => (
            <Card key={perk.title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream">
                <perk.icon className="h-6 w-6 text-brand-orange" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-brand-cocoa">{perk.title}</h3>
              <p className="mt-2 text-sm text-brand-cocoa/70">{perk.note}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
