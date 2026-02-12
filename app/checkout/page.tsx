import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { cartItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for Theo Kiddies orders.",
};

export default function CheckoutPage() {
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="bg-brand-cream py-12">
      <Container size="wide" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Checkout</h1>
        </div>

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
                  <Input placeholder="First name" />
                  <Input placeholder="Last name" />
                  <Input placeholder="Email" type="email" />
                  <Input placeholder="Phone" type="tel" />
                  <Input className="sm:col-span-2" placeholder="Street address" />
                  <Input placeholder="City" />
                  <Input placeholder="State" />
                  <Input placeholder="ZIP code" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Payment method</h2>
                <div className="mt-4 rounded-2xl border border-dashed border-brand-orange/30 bg-white p-6 text-sm text-brand-cocoa/70">
                  Payment options will appear here after connecting a payment provider.
                </div>
              </div>

              <Button size="lg" className="w-full">
                Place order
              </Button>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-brand-cocoa">{item.title}</p>
                    <p className="text-brand-cocoa/60">Qty {item.quantity}</p>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-brand-orange/10 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-brand-cocoa/60">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
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
      </Container>
    </div>
  );
}
