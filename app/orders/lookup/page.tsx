"use client";

import { useState } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

type OrderResult = {
  reference: string;
  status: "paid" | "failed" | "refunded";
  amount: number;
  currency: string;
  items: { display_name: string; value: string }[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
  } | null;
  deliveryFee: number;
  deliveryStatus: "quoted" | "to_be_quoted";
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-500",
};

export default function OrderLookupPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream py-10 sm:py-16">
      <Container className="max-w-lg space-y-6">
        <div className="text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-brand-orange/50" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Track an order
          </p>
          <h1 className="mt-2 text-2xl font-bold text-brand-cocoa sm:text-3xl">Find your order</h1>
          <p className="mt-2 text-sm text-brand-cocoa/60">
            Enter your order reference and the email you checked out with.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Order reference
              </label>
              <Input
                placeholder="e.g. T1KDKKJKFL"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>
            )}

            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking up…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Find my order
                </span>
              )}
            </Button>
          </form>
        </Card>

        {order && (
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                  Order {order.reference.toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-brand-cocoa/60">
                  Placed{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[order.status] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {order.status}
              </span>
            </div>

            {order.items.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-brand-orange/10 pt-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-brand-cocoa">{item.display_name}</span>
                    <span className="whitespace-nowrap text-brand-cocoa/60">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-brand-orange/10 pt-4 text-sm">
              <div className="flex items-center justify-between font-semibold text-brand-cocoa">
                <span>Total</span>
                <span>₦{order.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-brand-cocoa/60">
                <span>Delivery</span>
                <span>
                  {order.deliveryStatus === "to_be_quoted"
                    ? "To be confirmed on WhatsApp"
                    : order.deliveryFee > 0
                      ? `₦${order.deliveryFee.toLocaleString("en-NG")}`
                      : "Free"}
                </span>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 rounded-2xl bg-brand-cream p-4 text-sm text-brand-cocoa/70">
                <p className="font-semibold text-brand-cocoa">{order.shippingAddress.fullName}</p>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}
                </p>
              </div>
            )}
          </Card>
        )}
      </Container>
    </div>
  );
}
