"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionItem = {
  title: string;
  content: string | ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title} className="rounded-2xl border border-brand-orange/10 bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-brand-cocoa">{item.title}</span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-brand-cocoa/70">{item.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
