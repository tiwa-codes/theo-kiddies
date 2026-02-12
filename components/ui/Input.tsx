"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasIcon?: boolean;
};

export function Input({ className, hasIcon = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-full border border-brand-orange/10 bg-white px-4 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20",
        hasIcon && "pl-10",
        className
      )}
      {...props}
    />
  );
}
