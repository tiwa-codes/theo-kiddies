import { requireAdmin, adminAuthResponse } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BUCKET = "site-assets";

function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() : "jpg";
  const base = name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${base.slice(0, 50) || "image"}.${ext}`;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No image file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = sanitizeFileName(file.name);
    const key = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Upload failed: ${uploadError.message}. Ensure Storage bucket \"${BUCKET}\" exists and is public.`
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
    return Response.json({ url: data.publicUrl }, { status: 201 });
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    const message = err instanceof Error ? err.message : "Image upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
