import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch live counts from Supabase (gracefully falls back to 0 if not configured yet)
  let productCount = 0;
  let inStock = 0;
  let outOfStock = 0;
  let categoryCount = 0;
  let orderCount = 0;
  let customerCount = 0;
  let recentProducts: Array<{
    id: string;
    title: string;
    category: string;
    age_group: string;
    price: number;
    in_stock: boolean;
  }> = [];

  try {
    const [ordersRes, customersRes, productsCountRes, productsMetaRes, recentProductsRes] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("category, in_stock"),
      supabase
        .from("products")
        .select("id, title, category, age_group, price, in_stock")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    orderCount = ordersRes.count ?? 0;
    customerCount = customersRes.count ?? 0;
    productCount = productsCountRes.count ?? 0;

    const meta = productsMetaRes.data ?? [];
    inStock = meta.filter((item) => item.in_stock).length;
    outOfStock = meta.length - inStock;
    categoryCount = new Set(meta.map((item) => item.category).filter(Boolean)).size;

    recentProducts = (recentProductsRes.data as typeof recentProducts) ?? [];
  } catch {
    // Supabase not configured yet — show zeros
  }

  const stats = [
    {
      label: "Total Products",
      value: productCount,
      sub: `${inStock} in stock · ${outOfStock} out`,
      icon: Package,
      color: "bg-brand-orange/10 text-brand-orange",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: categoryCount,
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
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
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-gray-900">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-brand-orange hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentProducts.length === 0 && (
            <div className="px-4 py-8 text-sm text-gray-500 sm:px-6">
              No products yet. Add products from the Products page.
            </div>
          )}
          {recentProducts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-xs font-bold text-brand-orange">
                {p.title[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400">{p.category} · {p.age_group}</p>
              </div>
              <div className="w-full text-left sm:w-auto sm:text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₦{Number(p.price).toLocaleString("en-NG")}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.in_stock
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.in_stock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
