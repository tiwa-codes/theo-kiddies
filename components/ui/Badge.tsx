import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "orange" | "mint" | "sky" | "neutral";
};

export function Badge({ className, tone = "orange", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "orange" && "bg-brand-orange/10 text-brand-orange",
        tone === "mint" && "bg-accent-mint text-brand-cocoa",
        tone === "sky" && "bg-accent-sky text-brand-cocoa",
        tone === "neutral" && "bg-white text-brand-cocoa ring-1 ring-brand-orange/10",
        className
      )}
      {...props}
    />
  );
}
