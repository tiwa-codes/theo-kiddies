import { Download, Mail } from "lucide-react";
import { listSubscribers } from "@/lib/newsletter-store";
import type { Subscriber } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

const sourceLabels: Record<string, string> = {
  feedback: "Feedback page",
  footer: "Website footer",
  checkout: "Checkout",
};

async function load(): Promise<{ subscribers: Subscriber[]; failed: boolean }> {
  try {
    return { subscribers: await listSubscribers(), failed: false };
  } catch (err) {
    console.error("Failed to load subscribers:", err);
    return { subscribers: [], failed: true };
  }
}

export default async function AdminSubscribersPage() {
  const { subscribers, failed } = await load();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""} · from the newsletter box and the checkout opt-in
          </p>
        </div>
        {subscribers.length > 0 && (
          <a
            href="/api/admin/subscribers/export"
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
          >
            <Download className="h-4 w-4" />
            Download spreadsheet
          </a>
        )}
      </div>

      {failed ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t load subscribers. If the newsletter table hasn&apos;t been set up yet, run the
          &quot;Newsletter subscribers&quot; section at the end of <code>supabase/schema.sql</code> in the Supabase SQL editor.
        </div>
      ) : subscribers.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Mail className="h-10 w-10 text-gray-300" />
          <p className="mt-4 font-semibold text-gray-500">No subscribers yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            People appear here when they join from the feedback page or the website footer, or tick the newsletter box at checkout.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Signed up from</th>
                  <th className="px-5 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((s) => (
                  <tr key={s.email} className="transition hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.email}</td>
                    <td className="px-5 py-3 text-gray-600">{s.sources.map((src) => sourceLabels[src] ?? src).join(", ")}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(s.subscribedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
