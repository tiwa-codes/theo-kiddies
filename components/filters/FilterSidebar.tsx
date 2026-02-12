import { Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";

const filterSections = [
  {
    title: "Age",
    options: ["0-12 Months", "1-3 Years", "4-7 Years", "8-12 Years"],
  },
  {
    title: "Size",
    options: ["XS", "S", "M", "L", "XL"],
  },
  {
    title: "Gender",
    options: ["Girls", "Boys", "Unisex"],
  },
  {
    title: "Price range",
    options: ["$0-$25", "$25-$50", "$50-$100", "$100+"],
  },
  {
    title: "Availability",
    options: ["In stock", "Pre-order"],
  },
];

export function FilterSidebar() {
  return (
    <Card className="hidden w-full max-w-xs space-y-6 p-6 lg:block">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Filter className="h-4 w-4 text-brand-orange" />
      </div>
      {filterSections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            {section.title}
          </p>
          <div className="mt-3 space-y-2">
            {section.options.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-brand-cocoa/70">
                <input type="checkbox" className="accent-brand-orange" />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
