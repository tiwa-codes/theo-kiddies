"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email }),
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
      <div className="min-h-screen bg-brand-cream py-16">
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
    <div className="bg-brand-cream py-12">
      <Container size="wide" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Checkout</h1>
        </div>

        <form onSubmit={handleCheckout}>
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm text-brand-cocoa/70">
                <Lock className="h-4 w-4 text-brand-orange" />
                All transactions are encrypted and secure.
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Shipping details</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Input placeholder="First name" required />
                    <Input placeholder="Last name" required />
                    <Input
                      placeholder="Email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input placeholder="Phone" type="tel" />
                    <Input className="sm:col-span-2" placeholder="Street address" required />
                    <Input placeholder="City" required />
                    <Input placeholder="State" />
                    <Input placeholder="ZIP / Postal code" />
                  </div>
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

            <Card className="h-fit p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-brand-cocoa">{item.title}</p>
                      <span>
                    {item.color && `${item.color} · `}{item.size && `${item.size} · `}Qty {item.quantity}
                  </span>
                    </div>
                    <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-brand-orange/10 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-brand-cocoa/60">
                  <span>Shipping</span>
                  <span>Calculated by Paystack</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₦{subtotal.toFixed(2)}</span>
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
