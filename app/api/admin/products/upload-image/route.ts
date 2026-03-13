import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BUCKET = "products";

function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() : "jpg";
  const base = name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${base.slice(0, 50) || "image"}.${ext}`;
}

export async function POST(req: Request) {
  try {
    // Enforce admin auth when Clerk is configured.
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      const session = await auth();
      if (!session.userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return Response.json({ error: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = sanitizeFileName(file.name);
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

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
      urls.push(data.publicUrl);
    }

    return Response.json({ urls }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
