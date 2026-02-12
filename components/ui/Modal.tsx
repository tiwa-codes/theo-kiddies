"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl bg-white p-6 shadow-float",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="ml-auto block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange"
        >
          Close
        </button>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
