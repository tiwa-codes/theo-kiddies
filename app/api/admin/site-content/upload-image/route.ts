import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BUCKET = "site-assets";

function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() : "jpg";
  const base = name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${base.slice(0, 50) || "image"}.${ext}`;
}

async function requireAuth() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return;
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();

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
    const message = err instanceof Error ? err.message : "Image upload failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
