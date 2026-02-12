"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full border border-brand-orange/20 bg-white px-3 py-2",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="rounded-full p-1 hover:bg-brand-cream"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="rounded-full p-1 hover:bg-brand-cream"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
