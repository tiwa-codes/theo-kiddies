import Link from "next/link";
import {
  Backpack,
  Baby,
  Footprints,
  Gift,
  Shirt,
  Sparkles,
} from "lucide-react";
import { featuredCategories } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const iconMap = {
  shirt: Shirt,
  shoe: Footprints,
  toy: Sparkles,
  backpack: Backpack,
  baby: Baby,
  accessory: Gift,
};

export function FeaturedCategories() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Featured categories"
          subtitle="Everything you need, beautifully organized for busy parents."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap];
            return (
              <Card key={category.slug} className="flex items-center gap-4 p-6">
                <div className="rounded-2xl bg-brand-cream p-3">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-brand-cocoa">{category.title}</h3>
                  <p className="text-sm text-brand-cocoa/60">{category.description}</p>
                </div>
                <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-brand-orange">
                  Shop
                </Link>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
