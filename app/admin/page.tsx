import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { products, featuredCategories } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const inStock = products.filter((p) => p.inStock).length;
  const outOfStock = products.filter((p) => !p.inStock).length;

  // Fetch live counts from Supabase (gracefully falls back to 0 if not configured yet)
  let orderCount = 0;
  let customerCount = 0;
  try {
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("customers").select("*", { count: "exact", head: true }),
    ]);
    orderCount = ordersRes.count ?? 0;
    customerCount = customersRes.count ?? 0;
  } catch {
    // Supabase not configured yet — show zeros
  }

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      sub: `${inStock} in stock · ${outOfStock} out`,
      icon: Package,
      color: "bg-brand-orange/10 text-brand-orange",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: featuredCategories.length,
      sub: "Active categories",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      href: "/admin/products",
    },
    {
      label: "Orders",
      value: orderCount,
      sub: "Paid + fulfilled",
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-600",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: customerCount,
      sub: "Unique buyers",
      icon: Users,
      color: "bg-green-100 text-green-600",
      href: "/admin/customers",
    },
  ];
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-700">{label}</p>
            <p className="mt-1 text-xs text-gray-400">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent products */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-brand-orange hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-xs font-bold text-brand-orange">
                {p.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400">{p.category} · {p.ageGroup}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₦{p.price}</p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.inStock
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup checklist */}
      <div className="mt-8 rounded-2xl border border-dashed border-brand-orange/30 bg-brand-orange/5 p-6">
        <h2 className="font-semibold text-brand-cocoa">🚀 Store Setup Checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-cocoa/80">
          {[
            { done: true, text: "Global cart with Zustand (persists to localStorage)" },
            { done: true, text: "Wishlist with persistent state" },
            { done: true, text: "Paystack payment integration" },
            { done: true, text: "Order confirmation with payment verification" },
            { done: true, text: "Category filtering & sorting via URL params" },
            { done: true, text: "Supabase database – orders & customers saved automatically" },
            { done: true, text: "Resend transactional email on every successful order" },
            { done: true, text: "Clerk auth protecting /admin routes" },
            { done: false, text: "Add PAYSTACK live keys to Vercel environment variables" },
            { done: false, text: "Set Paystack webhook URL in Paystack Dashboard" },
            { done: false, text: "Verify sending domain in Resend Dashboard" },
            { done: false, text: "Replace mock products with real CMS or database" },
            { done: false, text: "Add real product images to /public/images" },
          ].map(({ done, text }) => (
            <li key={text} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? "✓" : "○"}
              </span>
              <span className={done ? "line-through opacity-60" : ""}>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
