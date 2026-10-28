"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20";

/** Where the thank-you card's QR code (theokiddies.com/feedback) sends customers. */
export function FeedbackContactsSettings() {
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/feedback-contacts");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load feedback contacts");
        setWhatsapp(data.whatsapp ?? "");
        setEmail(data.email ?? "");
      } catch (err) {
        setMessage({ text: err instanceof Error ? err.message : "Failed to load feedback contacts", ok: false });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/feedback-contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setWhatsapp(data.whatsapp);
      setEmail(data.email);
      setMessage({ text: "Feedback contacts updated", ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Thank-you card feedback</h2>
        <a
          href="/feedback"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
        >
          View page <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <form onSubmit={onSave} className="space-y-4 px-4 py-4 sm:px-6">
        <p className="text-xs text-gray-500">
          The QR code on the printed thank-you card opens theokiddies.com/feedback, which offers these two options.
          Changing them here takes effect immediately — the cards never need reprinting.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading feedback contacts...
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="feedback-whatsapp" className="mb-1 block text-sm font-semibold text-gray-700">
                WhatsApp number
              </label>
              <input
                id="feedback-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className={inputClass}
                placeholder="0814 068 8891"
                inputMode="tel"
                required
              />
            </div>

            <div>
              <label htmlFor="feedback-email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            {message && (
              <p className={`rounded-xl px-3 py-2 text-sm font-medium ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save contacts"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
