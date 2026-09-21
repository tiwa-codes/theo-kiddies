"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AGE_GROUPS } from "@/lib/ageGroups";

const filterSections = [
  { title: "Age", param: "age", options: [...AGE_GROUPS] },
  { title: "Size", param: "size", options: ["XS", "S", "M", "L", "One Size"] },
  { title: "Price range", param: "price", options: ["₦0-₦5,000", "₦5,000-₦15,000", "₦15,000-₦30,000", "₦30,000+"] },
  { title: "Availability", param: "availability", options: ["In stock", "Pre-order"] },
];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // "|" not "," — several option values (the price bands) contain commas
  // themselves as thousands separators, which silently corrupted the
  // multi-select round-trip when "," doubled as both the delimiter and
  // part of a value. Found while pushing price-band filtering into the
  // Supabase query for 2.3.
  function toggle(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(param)?.split("|").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length) {
      params.set(param, next.join("|"));
    } else {
      params.delete(param);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function isChecked(param: string, value: string) {
    return searchParams.get(param)?.split("|").includes(value) ?? false;
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const hasFilters = filterSections.some((s) => searchParams.has(s.param));

  return (
    <Card className="hidden w-full max-w-xs space-y-6 p-6 lg:block">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              Clear all
            </button>
          )}
          <Filter className="h-4 w-4 text-brand-orange" />
        </div>
      </div>
      {filterSections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            {section.title}
          </p>
          <div className="mt-3 space-y-2">
            {section.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-cocoa/70 transition hover:text-brand-cocoa"
              >
                <input
                  type="checkbox"
                  className="accent-brand-orange"
                  checked={isChecked(section.param, option)}
                  onChange={() => toggle(section.param, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

