import { requireAdmin, adminAuthResponse } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { HOME_HERO_KEYS } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", [HOME_HERO_KEYS.image, HOME_HERO_KEYS.alt]);

    if (error) throw error;

    const map = new Map<string, string>();
    (data ?? []).forEach((row) => map.set(row.key as string, row.value as string));

    return Response.json({
      heroImageUrl: map.get(HOME_HERO_KEYS.image) ?? "",
      heroImageAlt: map.get(HOME_HERO_KEYS.alt) ?? "",
    });
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    const message = err instanceof Error ? err.message : "Failed to fetch site content";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const heroImageUrl = String(body.heroImageUrl ?? "").trim();
    const heroImageAlt = String(body.heroImageAlt ?? "").trim();

    if (!heroImageUrl) {
      return Response.json({ error: "Hero image URL is required" }, { status: 400 });
    }

    const payload = [
      { key: HOME_HERO_KEYS.image, value: heroImageUrl },
      { key: HOME_HERO_KEYS.alt, value: heroImageAlt || "Mother and son choosing children's outfits in a retail store" },
    ];

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "key" });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    const message = err instanceof Error ? err.message : "Failed to save site content";
    return Response.json({ error: message }, { status: 500 });
  }
}
