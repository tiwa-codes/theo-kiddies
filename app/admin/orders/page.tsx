import { ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase, type Order } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  failed:   "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-500",
};

async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data as Order[]) ?? [];
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((t, o) => t + o.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""} · ₦{totalRevenue.toLocaleString("en-NG")} revenue
          </p>
        </div>
        <Link
          href="https://dashboard.paystack.com"
          target="_blank"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Paystack Dashboard <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Orders",       value: orders.length,                                   color: "bg-brand-orange/10 text-brand-orange" },
          { label: "Successful",         value: orders.filter((o) => o.status === "paid").length, color: "bg-green-100 text-green-700" },
          { label: "Refunded / Other",   value: orders.filter((o) => o.status !== "paid").length, color: "bg-gray-100 text-gray-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
            <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>live data</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
          <p className="mt-4 font-semibold text-gray-500">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Orders appear here once customers complete payment. Ensure your Paystack webhook points to{" "}
            <code className="rounded bg-gray-100 px-1">/api/webhooks/paystack</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.reference.toUpperCase()}</td>
                  <td className="px-5 py-3 text-gray-900">{order.email}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ₦{order.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusStyles[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


