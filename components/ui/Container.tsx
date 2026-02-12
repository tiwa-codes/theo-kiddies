import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide";
};

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        size === "wide" ? "max-w-7xl" : "max-w-6xl",
        className
      )}
      {...props}
    />
  );
}
