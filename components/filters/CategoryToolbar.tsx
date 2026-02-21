"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

const filterSections = [
  { title: "Age", param: "age", options: ["0-12 Months", "1-3 Years", "4-7 Years", "8-12 Years"] },
  { title: "Size", param: "size", options: ["XS", "S", "M", "L", "One Size"] },
  { title: "Price range", param: "price", options: ["$0-$25", "$25-$50", "$50-$100", "$100+"] },
  { title: "Availability", param: "availability", options: ["In stock", "Pre-order"] },
];

export function CategoryToolbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggle(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(param)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length) {
      params.set(param, next.join(","));
    } else {
      params.delete(param);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function isChecked(param: string, value: string) {
    return searchParams.get(param)?.split(",").includes(value) ?? false;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-brand-orange/15 px-4 py-2 text-sm font-semibold lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      <div className="ml-auto flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-cocoa/60" />
        <select
          className="rounded-full border border-brand-orange/15 bg-white px-4 py-2 text-sm font-semibold"
          aria-label="Sort products"
          value={searchParams.get("sort") ?? "featured"}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} side="left">
        <div className="flex h-full flex-col gap-6 px-6 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="space-y-6 overflow-y-auto">
            {filterSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                  {section.title}
                </p>
                <div className="mt-3 space-y-2">
                  {section.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 text-sm text-brand-cocoa/70"
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
          </div>
          <Button className="w-full" onClick={() => setOpen(false)}>Apply filters</Button>
        </div>
      </Drawer>
    </div>
  );
}
