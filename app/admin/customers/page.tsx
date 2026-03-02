import { Users } from "lucide-react";
import { supabase, type Customer } from "@/lib/supabase";

async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("total_spent", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data as Customer[]) ?? [];
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  const totalRevenue = customers.reduce((t, c) => t + c.total_spent, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-500">
        {customers.length} customer{customers.length !== 1 ? "s" : ""} · ₦{totalRevenue.toLocaleString("en-NG")} lifetime value
      </p>

      {customers.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="mt-4 font-semibold text-gray-500">No customers yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Customers are created automatically when their first order is completed via Paystack.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spent</th>
                <th className="px-5 py-3">First Order</th>
                <th className="px-5 py-3">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{c.email}</td>
                  <td className="px-5 py-3 text-gray-600">{c.order_count}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ₦{c.total_spent.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(c.first_seen).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(c.last_seen).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
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
