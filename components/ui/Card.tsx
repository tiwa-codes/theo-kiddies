import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function Card({ className, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-soft",
        hover && "transition-all hover:-translate-y-0.5 hover:shadow-float",
        className
      )}
      {...props}
    />
  );
}
