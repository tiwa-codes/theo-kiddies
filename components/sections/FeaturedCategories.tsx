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
import { FadeIn } from "@/components/ui/FadeIn";

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
        <FadeIn>
          <SectionHeader
            title="Featured categories"
            subtitle="Everything you need, beautifully organized for busy parents."
          />
        </FadeIn>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, i) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap];
            return (
              <FadeIn key={category.slug} delay={i * 70}>
                <Card className="flex h-full items-center gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
                  <div className="rounded-2xl bg-brand-cream p-3 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-brand-cocoa">{category.title}</h3>
                    <p className="text-sm text-brand-cocoa/60">{category.description}</p>
                  </div>
                  <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-brand-orange transition-transform duration-200 hover:translate-x-0.5">
                    Shop
                  </Link>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
