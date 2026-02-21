"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Extra delay in ms applied on top of any stagger class */
  delay?: number;
  /** CSS reveal variant class. Defaults to "reveal" (fade up). Use "reveal-left" for slide from left. */
  variant?: "reveal" | "reveal-left";
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({
  children,
  className,
  delay,
  variant = "reveal",
  as: Tag = "div",
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Comp = Tag as any;

  return (
    <Comp
      ref={ref}
      className={cn(variant, className)}
      style={delay != null ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Comp>
  );
}
