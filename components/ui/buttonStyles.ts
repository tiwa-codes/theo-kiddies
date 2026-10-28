import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button styles, shared by <Button> and links that should look like buttons.
 * Kept out of Button.tsx ("use client") so server components can call it too.
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" &&
      "bg-brand-orange text-white shadow-soft hover:-translate-y-0.5 hover:shadow-float",
    variant === "secondary" &&
      "bg-white text-brand-cocoa ring-1 ring-brand-orange/15 hover:bg-brand-cream",
    variant === "ghost" && "text-brand-cocoa hover:bg-brand-cream",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-6 py-3 text-base",
    className
  );
}
