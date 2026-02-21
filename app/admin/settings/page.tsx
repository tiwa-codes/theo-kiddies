import { Settings } from "lucide-react";

const sections = [
  {
    title: "Payment",
    items: [
      { label: "Paystack Secret Key", value: "sk_test_••••••••", hint: "Set via PAYSTACK_SECRET_KEY in .env.local" },
      { label: "Paystack Currency", value: "NGN", hint: "Set via PAYSTACK_CURRENCY in .env.local" },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Store Name", value: "Theo Kiddies", hint: "Update in app/layout.tsx metadata" },
      { label: "WhatsApp Number", value: "+1 555 1234567", hint: "Update in components/layout/WhatsAppButton.tsx" },
      { label: "Announcement", value: "Free nationwide delivery on orders over $75", hint: "Update in lib/data.ts" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { label: "Store URL", value: "http://localhost:3000", hint: "Set via NEXT_PUBLIC_URL in .env.local" },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6 text-brand-orange" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-3 text-sm text-amber-800 mb-6">
        Settings are currently managed via environment variables and source files. A visual settings
        editor requires a database-backed admin API.
      </div>

      <div className="space-y-6">
        {sections.map(({ title, items }) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map(({ label, value, hint }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
                  </div>
                  <code className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-mono text-gray-700 whitespace-nowrap">
                    {value}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
