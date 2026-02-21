import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OrderConfirmationContent } from "./OrderConfirmationContent";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-cream">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
            <p className="text-sm font-semibold text-brand-cocoa">Loading…</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
