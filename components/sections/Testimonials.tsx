import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Testimonials() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeader
          title="Loved by families"
          subtitle="Parents and guardians across the country count on Theo Kiddies for everyday wins."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((entry, index) => (
            <Card
              key={entry.name}
              className="animate-fade-up p-6"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-center gap-1 text-brand-orange">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star key={star} className="h-4 w-4 fill-brand-orange" />
                ))}
              </div>
              <p className="mt-4 text-sm text-brand-cocoa/70">"{entry.note}"</p>
              <div className="mt-4 text-sm font-semibold text-brand-cocoa">
                {entry.name}
                <span className="ml-2 text-xs font-normal text-brand-cocoa/60">{entry.location}</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
