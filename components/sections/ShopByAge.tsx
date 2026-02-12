import Link from "next/link";
import { shopByAge } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ShopByAge() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Shop by age"
          subtitle="Find fits and essentials tailored to each stage of growth."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shopByAge.map((age) => (
            <Card key={age.title} className="p-6">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-full bg-accent-apricot" />
                <div>
                  <h3 className="text-lg font-semibold text-brand-cocoa">{age.title}</h3>
                  <p className="mt-1 text-sm text-brand-cocoa/70">{age.note}</p>
                </div>
                <Link href={age.href} className="text-sm font-semibold text-brand-orange">
                  Shop now
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
