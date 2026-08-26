"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/nigeria";

type DeliveryRate = {
  state: string;
  fee: number;
  active: boolean;
};

type RowState = { fee: string; active: boolean; saving: boolean; dirty: boolean };

export default function AdminDeliveryPage() {
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/delivery-rates");
    const data = await res.json();
    const list: DeliveryRate[] = Array.isArray(data) ? data : [];
    // Sort to match the checkout dropdown's order, not raw DB/collation order.
    const sorted = [...list].sort(
      (a, b) => NIGERIAN_STATES.indexOf(a.state as never) - NIGERIAN_STATES.indexOf(b.state as never)
    );
    setRates(sorted);
    setRows(
      Object.fromEntries(
        sorted.map((r) => [r.state, { fee: String(r.fee), active: r.active, saving: false, dirty: false }])
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function setFee(state: string, fee: string) {
    setRows((prev) => ({ ...prev, [state]: { ...prev[state], fee, dirty: true } }));
  }

  function setActive(state: string, active: boolean) {
    setRows((prev) => ({ ...prev, [state]: { ...prev[state], active, dirty: true } }));
  }

  async function saveRow(state: string) {
    const row = rows[state];
    if (!row) return;
    const fee = Number(row.fee);
    if (!Number.isFinite(fee) || fee < 0) {
      showToast("Fee must be a non-negative number", false);
      return;
    }

    setRows((prev) => ({ ...prev, [state]: { ...prev[state], saving: true } }));
    try {
      const res = await fetch("/api/admin/delivery-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, fee, active: row.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setRows((prev) => ({
        ...prev,
        [state]: { fee: String(data.fee), active: data.active, saving: false, dirty: false },
      }));
      showToast(`${state} updated ✓`);
    } catch (err) {
      setRows((prev) => ({ ...prev, [state]: { ...prev[state], saving: false } }));
      showToast(err instanceof Error ? err.message : "Save failed", false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-float ${
            toast.ok ? "bg-brand-cocoa" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery rates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Per-state flat delivery fee — a store policy, not a courier quote. A state charges nothing and
          shows &quot;confirmed on WhatsApp&quot; at checkout until you set a fee and switch it active.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Fee (₦)</th>
                  <th className="px-5 py-3">Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map((rate) => {
                  const row = rows[rate.state];
                  if (!row) return null;
                  return (
                    <tr key={rate.state} className="transition hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">{rate.state}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.fee}
                          onChange={(e) => setFee(rate.state, e.target.value)}
                          className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={row.active}
                            onChange={(e) => setActive(rate.state, e.target.checked)}
                            className="h-4 w-4 rounded accent-brand-orange"
                          />
                          <span
                            className={`text-xs font-semibold ${row.active ? "text-green-700" : "text-gray-400"}`}
                          >
                            {row.active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => saveRow(rate.state)}
                          disabled={!row.dirty || row.saving}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {row.saving && <Loader2 className="h-3 w-3 animate-spin" />}
                          {row.saving ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
