import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/15551234567"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-float transition hover:-translate-y-0.5"
      aria-label="Chat on WhatsApp"
      target="_blank"
      rel="noreferrer"
    >
      <MessageCircle className="h-4 w-4" />
      WhatsApp
    </Link>
  );
}
