"use client";

import type { ButtonHTMLAttributes } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ className, variant = "primary", size = "md", type, ...props }: ButtonProps) {
  return <button type={type ?? "button"} className={buttonClassName({ variant, size, className })} {...props} />;
}
