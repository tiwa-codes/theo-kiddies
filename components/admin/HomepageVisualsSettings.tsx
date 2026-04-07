"use client";

import { useEffect, useState } from "react";
import { Loader2, ImagePlus, Save } from "lucide-react";

export function HomepageVisualsSettings() {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageAlt, setHeroImageAlt] = useState("Mother and son choosing children's outfits in a retail store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/site-content");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load settings");
        setHeroImageUrl(data.heroImageUrl || "");
        setHeroImageAlt(data.heroImageAlt || "Mother and son choosing children's outfits in a retail store");
      } catch (err) {
        setMessage({ text: err instanceof Error ? err.message : "Failed to load settings", ok: false });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onUpload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/site-content/upload-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setHeroImageUrl(data.url);
      setMessage({ text: "Image uploaded successfully", ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Upload failed", ok: false });
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageUrl, heroImageAlt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage({ text: "Homepage visual updated", ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Homepage Visuals</h2>
      </div>

      <form onSubmit={onSave} className="space-y-4 px-4 py-4 sm:px-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading visual settings...
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Hero Image</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-orange/20 px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:bg-brand-orange/5">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  {uploading ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUpload(f);
                      e.currentTarget.value = "";
                    }}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-400">Or paste a direct image URL below</p>
              </div>
              <input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Image Alt Text</label>
              <input
                value={heroImageAlt}
                onChange={(e) => setHeroImageAlt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                placeholder="Describe the image for accessibility"
              />
            </div>

            {heroImageUrl && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImageUrl} alt={heroImageAlt || "Hero preview"} className="h-40 w-full rounded-xl border border-gray-200 object-cover" />
              </div>
            )}

            {message && (
              <p className={`rounded-xl px-3 py-2 text-sm font-medium ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {!saving && <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save visuals"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
