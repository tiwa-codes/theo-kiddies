"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/currency";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { useCartStore } from "@/store/cart";

type DeliveryQuote = {
  fee: number;
  status: "quoted" | "to_be_quoted";
  message: string;
};

const fieldClass =
  "w-full rounded-2xl border border-brand-orange/10 bg-white px-4 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [delivery, setDelivery] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Live delivery quote as soon as a state is picked — no logistics rate
  // is public data, so this has to ask the server rather than compute
  // locally. Doesn't touch Paystack or create an order.
  useEffect(() => {
    if (!state) {
      setDelivery(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, subtotalNaira: subtotal }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!cancelled) setDelivery(res.ok ? data : null);
      })
      .catch(() => {
        if (!cancelled) setDelivery(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state, subtotal]);

  const deliveryFee = delivery?.fee ?? 0;
  const total = subtotal + deliveryFee;

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            quantity: i.quantity,
            // Prefer the human-readable label — this is what ends up on the
            // order row and in the confirmation email, and "coral" isn't
            // useful there. Falls back to the id for carts saved before
            // labels existed.
            color: i.colorLabel ?? i.color,
            size: i.sizeLabel ?? i.size,
          })),
          address: {
            fullName,
            email,
            phone,
            altPhone: altPhone || undefined,
            state,
            city,
            street,
            landmark: landmark || undefined,
            notes: notes || undefined,
            newsletterOptIn,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      // Redirect to Paystack hosted checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-brand-cream py-10 sm:py-16">
        <Container className="max-w-md space-y-6 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-orange/40" />
          <h1 className="text-2xl font-bold text-brand-cocoa">Your cart is empty</h1>
          <p className="text-sm text-brand-cocoa/60">
            Add some items before checking out.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
          >
            Continue shopping
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream py-8 sm:py-12">
      <Container size="wide" className="space-y-6 sm:space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Secure checkout
          </p>
          <h1 className="mt-2 text-2xl font-bold text-brand-cocoa sm:text-3xl">Checkout</h1>
        </div>

        <form onSubmit={handleCheckout}>
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-brand-cocoa/70">
                <Lock className="h-4 w-4 text-brand-orange" />
                All transactions are encrypted and secure.
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Contact details</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Input
                      className="sm:col-span-2"
                      placeholder="Full name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Phone (e.g. 0803 123 4567)"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Delivery address</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <select
                      className={fieldClass}
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="" disabled>
                        State
                      </option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="City / town"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <Input
                      className="sm:col-span-2"
                      placeholder="Street address"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                    <Input
                      placeholder="Nearest landmark (optional)"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                    <Input
                      placeholder="Alternative phone (optional)"
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                    <textarea
                      className={`${fieldClass} sm:col-span-2 rounded-2xl`}
                      placeholder="Delivery notes (optional) — e.g. leave with the gateman"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <label className="mt-4 flex items-start gap-2 text-sm text-brand-cocoa/70">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-brand-orange/30 text-brand-orange focus:ring-brand-orange/30"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    />
                    Keep me posted about new arrivals and offers by email.
                  </label>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <div className="mt-4 rounded-2xl border border-brand-orange/20 bg-white p-5 text-sm text-brand-cocoa/70">
                    <div className="flex items-start gap-3">
                      <img
                        src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png"
                        alt="Paystack"
                        className="mt-0.5 h-6 w-6 rounded-full bg-[#00c3f7] object-contain p-0.5"
                      />
                      <p>
                        You&apos;ll be taken to <strong className="text-brand-cocoa">Paystack&apos;s</strong> secure
                        hosted checkout. Pay with card, bank transfer, USSD, or mobile money.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Paystack…
                    </span>
                  ) : (
                    "Pay with Paystack"
                  )}
                </Button>
              </div>
            </Card>

            <Card className="h-fit p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-cocoa">{item.title}</p>
                      <span className="text-xs text-brand-cocoa/70">
                    {(item.colorLabel ?? item.color) && `${item.colorLabel ?? item.color} · `}
                    {(item.sizeLabel ?? item.size) && `${item.sizeLabel ?? item.size} · `}
                    Qty {item.quantity}
                  </span>
                    </div>
                    <span className="whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-brand-orange/10 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-start justify-between gap-3 text-brand-cocoa/60">
                  <span>Shipping</span>
                  <span className="text-right">
                    {quoteLoading
                      ? "Calculating…"
                      : delivery
                        ? delivery.message
                        : "Select your state to see delivery cost"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-brand-cream p-4 text-xs text-brand-cocoa/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-orange" />
                  Protected checkout with fraud monitoring.
                </div>
              </div>
              <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-brand-orange">
                Continue shopping
              </Link>
            </Card>
          </div>
        </form>
      </Container>
    </div>
  );
}
