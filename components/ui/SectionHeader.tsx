import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col text-center",
        className
      )}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
          Theo Kiddies
        </p>
        <h2 className="mt-2 text-2xl font-bold text-brand-cocoa sm:text-3xl">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-brand-cocoa/70 sm:text-base">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
