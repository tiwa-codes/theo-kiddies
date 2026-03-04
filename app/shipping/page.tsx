import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Shipping & Delivery – Theo Kiddies",
  description: "Delivery times, areas, and shipping policy for Theo Kiddies.",
};

const deliveryZones = [
  { zone: "Lagos (Island & Mainland)", time: "1–2 business days", fee: "₦1,500" },
  { zone: "Abuja (FCT)", time: "2–3 business days", fee: "₦2,000" },
  { zone: "Port Harcourt", time: "2–3 business days", fee: "₦2,000" },
  { zone: "Ibadan, Kano, Enugu, Benin City", time: "3–4 business days", fee: "₦2,500" },
  { zone: "Other states", time: "4–6 business days", fee: "₦3,000" },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Delivery
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Shipping &amp; Delivery</h1>
          <p className="mt-3 max-w-xl text-sm text-brand-cocoa/70">
            We deliver to all 36 states and the FCT. Orders placed before 12 pm are dispatched same day.
          </p>
        </div>

        <div className="max-w-2xl space-y-8">
          {/* Free shipping banner */}
          <div className="rounded-2xl bg-brand-orange px-6 py-5 text-white">
            <p className="font-semibold">Free delivery on orders over ₦15,000</p>
            <p className="mt-1 text-sm text-white/80">
              No promo code needed — discount is applied automatically at checkout.
            </p>
          </div>

          {/* Delivery zones table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Delivery Zones &amp; Timelines</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Estimated Time</th>
                  <th className="px-6 py-3">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveryZones.map(({ zone, time, fee }) => (
                  <tr key={zone}>
                    <td className="px-6 py-4 font-medium text-brand-cocoa">{zone}</td>
                    <td className="px-6 py-4 text-brand-cocoa/70">{time}</td>
                    <td className="px-6 py-4 font-semibold text-brand-orange">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4 text-sm text-brand-cocoa/70">
            <div>
              <p className="font-semibold text-brand-cocoa mb-1">Order Tracking</p>
              <p>You&apos;ll receive an email with your tracking details once your order is dispatched. You can also WhatsApp us your order reference for real-time updates.</p>
            </div>
            <div>
              <p className="font-semibold text-brand-cocoa mb-1">Pickup Option</p>
              <p>In-store pickup is available in Lagos. Select &quot;Pickup&quot; at checkout and we&apos;ll confirm the pickup address via email.</p>
            </div>
            <div>
              <p className="font-semibold text-brand-cocoa mb-1">International Shipping</p>
              <p>We currently only ship within Nigeria. International shipping is coming soon — follow us on Instagram to be notified.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
