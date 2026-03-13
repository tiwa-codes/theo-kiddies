import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Package, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { supabase, type Order } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "My Orders – Theo Kiddies",
};

export const dynamic = "force-dynamic";

async function getMyOrders(emails: string[]): Promise<Order[]> {
  if (!emails.length) return [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("email", emails)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Order[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AccountOrdersPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream py-8 sm:py-12">
        <Container size="wide" className="space-y-6">
          <h1 className="text-2xl font-bold text-brand-cocoa sm:text-3xl">My Orders</h1>
          <Card className="p-4 sm:p-6">
            <p className="font-semibold text-brand-cocoa">Sign in to view your orders</p>
            <p className="mt-1 text-sm text-brand-cocoa/70">Use the same email you used at checkout.</p>
            <div className="mt-4">
              <Link href="/sign-in" className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white">
                Sign in
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const emails = user.emailAddresses.map((e) => e.emailAddress);
  const orders = await getMyOrders(emails);

  return (
    <div className="min-h-screen bg-brand-cream py-8 sm:py-12">
      <Container size="wide" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">My Account</p>
          <h1 className="mt-2 text-2xl font-bold text-brand-cocoa sm:text-3xl">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="p-6 text-center sm:p-10">
            <ShoppingBag className="mx-auto h-9 w-9 text-brand-orange/50" />
            <p className="mt-3 font-semibold text-brand-cocoa">No orders yet</p>
            <p className="mt-1 text-sm text-brand-cocoa/70">When you complete checkout, your orders will appear here.</p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white">
              Start shopping
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">Reference</p>
                    <p className="mt-1 break-all font-mono text-xs text-brand-cocoa sm:text-sm">{order.reference.toUpperCase()}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-brand-cocoa/60">Amount</p>
                    <p className="font-semibold text-brand-cocoa">₦{order.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-cocoa/60">Items</p>
                    <p className="font-semibold text-brand-cocoa">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-cocoa/60">Date</p>
                    <p className="font-semibold text-brand-cocoa">{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
          <Package className="h-4 w-4" />
          Back to account
        </Link>
      </Container>
    </div>
  );
}
