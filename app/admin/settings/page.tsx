import { Settings, CheckCircle2, XCircle } from "lucide-react";
import { announcement } from "@/lib/data";
import { siteConfig } from "@/lib/config";

type SettingItem = {
  label: string;
  value: string;
  hint: string;
  status?: "ok" | "warn" | "missing";
};

function StatusBadge({ status }: { status?: SettingItem["status"] }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
  if (status === "missing") return <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />;
  return null;
}

export default function AdminSettingsPage() {
  const paystackKey = process.env.PAYSTACK_SECRET_KEY ?? "";
  const isLive = paystackKey.startsWith("sk_live");

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Payment",
      items: [
        {
          label: "Paystack Secret Key",
          value: paystackKey ? (isLive ? "sk_live_●●●●●●●●" : "sk_test_●●●●●●●●") : "Not set",
          hint: "Set via PAYSTACK_SECRET_KEY in .env.local",
          status: paystackKey ? (isLive ? "ok" : "warn") : "missing",
        },
        {
          label: "Paystack Mode",
          value: isLive ? "🟢 Live" : "🟡 Test",
          hint: isLive ? "Processing real payments" : "Switch to live keys before launch",
          status: isLive ? "ok" : "warn",
        },
        {
          label: "Currency",
          value: process.env.PAYSTACK_CURRENCY ?? "NGN",
          hint: "Set via PAYSTACK_CURRENCY in .env.local",
          status: "ok",
        },
      ],
    },
    {
      title: "Database",
      items: [
        {
          label: "Supabase URL",
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Connected ✓" : "Not set",
          hint: "Set via NEXT_PUBLIC_SUPABASE_URL in .env.local",
          status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "missing",
        },
        {
          label: "Supabase Service Key",
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set ✓" : "Not set",
          hint: "Set via SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only)",
          status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "missing",
        },
      ],
    },
    {
      title: "Email",
      items: [
        {
          label: "Resend API Key",
          value: process.env.RESEND_API_KEY ? "Set ✓" : "Not set",
          hint: "Set via RESEND_API_KEY in .env.local",
          status: process.env.RESEND_API_KEY ? "ok" : "missing",
        },
        {
          label: "From Address",
          value: process.env.RESEND_FROM_ADDRESS ?? "Not set",
          hint: "Set via RESEND_FROM_ADDRESS in .env.local",
          status: process.env.RESEND_FROM_ADDRESS ? "ok" : "missing",
        },
      ],
    },
    {
      title: "Admin Auth",
      items: [
        {
          label: "Clerk Publishable Key",
          value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set ✓" : "Not set",
          hint: "Set via NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local",
          status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "ok" : "missing",
        },
        {
          label: "Clerk Secret Key",
          value: process.env.CLERK_SECRET_KEY ? "Set ✓" : "Not set",
          hint: "Set via CLERK_SECRET_KEY in .env.local",
          status: process.env.CLERK_SECRET_KEY ? "ok" : "missing",
        },
      ],
    },
    {
      title: "Store",
      items: [
        { label: "Store Name", value: "Theo Kiddies", hint: "Update in app/layout.tsx metadata", status: "ok" },
        { label: "Phone", value: siteConfig.phone, hint: "Set via NEXT_PUBLIC_STORE_PHONE in .env.local", status: "ok" },
        { label: "Email", value: siteConfig.email, hint: "Set via NEXT_PUBLIC_STORE_EMAIL in .env.local", status: "ok" },
        { label: "WhatsApp", value: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`, hint: "Set via NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local", status: "ok" },
        { label: "Announcement Banner", value: announcement, hint: "Update the announcement export in lib/data.ts", status: "ok" },
      ],
    },
    {
      title: "Deployment",
      items: [
        {
          label: "Store URL",
          value: process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
          hint: "Set via NEXT_PUBLIC_URL in .env.local",
          status: process.env.NEXT_PUBLIC_URL ? "ok" : "warn",
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6 text-brand-orange" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        {sections.map(({ title, items }) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map(({ label, value, hint, status }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="flex items-start gap-2">
                    <StatusBadge status={status} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
                    </div>
                  </div>
                  <code className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-mono text-gray-700 whitespace-nowrap max-w-xs truncate">
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
