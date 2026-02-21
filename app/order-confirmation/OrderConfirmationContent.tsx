"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Package, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ClearCartOnLoad } from "@/components/cart/ClearCartOnLoad";

type VerifyResult = {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  currency: string;
  email: string;
  paidAt: string;
};

export function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    if (!reference) { setLoading(false); return; }
    fetch(`/api/verify-payment?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((data) => { if (data.error) throw new Error(data.error); setResult(data); })
      .catch((e) => setVerifyError(e.message))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
          <p className="text-sm font-semibold text-brand-cocoa">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (verifyError || (result && result.status !== "success")) {
    return (
      <div className="min-h-screen bg-brand-cream py-16">
        <Container className="max-w-2xl space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-brand-cocoa">Payment unsuccessful</h1>
            <p className="text-brand-cocoa/70">
              {verifyError || "Your payment was not completed. You have not been charged."}
            </p>
            {reference && (
              <p className="rounded-2xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cocoa/50 shadow-soft">
                Ref: {reference.toUpperCase()}
              </p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/checkout" className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
              Try again
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-cocoa ring-1 ring-brand-orange/15 transition hover:bg-brand-cream">
              Continue shopping
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-16">
      {result?.status === "success" && <ClearCartOnLoad />}
      <Container className="max-w-2xl space-y-8 text-center">
        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-brand-cocoa">Order confirmed!</h1>
          <p className="text-brand-cocoa/70">
            Thank you for shopping with Theo Kiddies. We&apos;ve received your payment
            {result?.email && (
              <> and will send a confirmation to <strong className="text-brand-cocoa">{result.email}</strong></>
            )}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {result?.reference && (
              <p className="rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70 shadow-soft">
                Ref: {result.reference.toUpperCase()}
              </p>
            )}
            {result?.amount != null && (
              <p className="rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-brand-cocoa shadow-soft">
                ₦{result.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} {result.currency}
              </p>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl bg-white p-6 text-left shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-brand-cocoa">
            <Package className="h-4 w-4 text-brand-orange" />
            What happens next?
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-cocoa/70">
            {[
              "You'll receive an order confirmation email with tracking details.",
              "Your order will be dispatched within 1–2 business days.",
              "Delivery typically takes 2–5 business days.",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"
          >
            Continue shopping
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-cocoa ring-1 ring-brand-orange/15 transition hover:bg-brand-cream"
          >
            View my account
          </Link>
        </div>
      </Container>
    </div>
  );
}
