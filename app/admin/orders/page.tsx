import { ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";

// Mock orders — replace with real data from your database / Paystack webhook log
const mockOrders = [
  {
    id: "ORD-001",
    ref: "tkpay_demo_1abc23",
    customer: "Alicia M.",
    email: "alicia@example.com",
    amount: 9800,
    status: "success",
    items: 2,
    date: "21 Feb 2026",
  },
  {
    id: "ORD-002",
    ref: "tkpay_demo_2def45",
    customer: "Jordan P.",
    email: "jordan@example.com",
    amount: 3600,
    status: "success",
    items: 1,
    date: "20 Feb 2026",
  },
  {
    id: "ORD-003",
    ref: "tkpay_demo_3ghi67",
    customer: "Samantha R.",
    email: "samantha@example.com",
    amount: 6400,
    status: "abandoned",
    items: 2,
    date: "19 Feb 2026",
  },
];

const statusStyles: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  abandoned: "bg-gray-100 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
};

export default function AdminOrdersPage() {
  const totalRevenue = mockOrders
    .filter((o) => o.status === "success")
    .reduce((t, o) => t + o.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {mockOrders.length} orders · ₦{totalRevenue.toLocaleString("en-NG")} revenue (demo)
          </p>
        </div>
      </div>

      {/* Paystack webhook notice */}
      <div className="mb-5 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <p className="font-semibold">How to get real orders</p>
        <ol className="mt-2 list-decimal pl-4 space-y-1 text-blue-800">
          <li>
            Set up a <strong>Paystack webhook</strong> pointing to{" "}
            <code className="rounded bg-blue-100 px-1">/api/webhooks/paystack</code> in your Paystack dashboard.
          </li>
          <li>Store the <code className="rounded bg-blue-100 px-1">charge.success</code> event data in a database (e.g. Supabase, PlanetScale).</li>
          <li>Replace the mock orders above with a database query.</li>
        </ol>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Orders",
            value: mockOrders.length,
            color: "bg-brand-orange/10 text-brand-orange",
          },
          {
            label: "Successful",
            value: mockOrders.filter((o) => o.status === "success").length,
            color: "bg-green-100 text-green-700",
          },
          {
            label: "Abandoned / Failed",
            value: mockOrders.filter((o) => o.status !== "success").length,
            color: "bg-gray-100 text-gray-500",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
            <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>
              demo data
            </div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockOrders.map((order) => (
              <tr key={order.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{order.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.email}</p>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  ₦{order.amount.toLocaleString("en-NG")}
                </td>
                <td className="px-5 py-3 text-gray-600">{order.items}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                      statusStyles[order.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{order.date}</td>
                <td className="px-5 py-3 text-right">
                  <span className="font-mono text-xs text-gray-400">{order.ref}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Showing demo data.{" "}
        <Link href="https://dashboard.paystack.com" target="_blank" className="text-brand-orange hover:underline inline-flex items-center gap-1">
          View live transactions on Paystack <ExternalLink className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
