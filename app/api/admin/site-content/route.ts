import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { HOME_HERO_KEYS } from "@/lib/site-content";

export const dynamic = "force-dynamic";

async function requireAuth() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return;
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }
}

export async function GET() {
  try {
    await requireAuth();

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
    const message = err instanceof Error ? err.message : "Failed to fetch site content";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();

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
    const message = err instanceof Error ? err.message : "Failed to save site content";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
