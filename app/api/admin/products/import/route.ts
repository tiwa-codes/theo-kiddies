import { supabase } from "@/lib/supabase";
import { parseProkipProductsCsv } from "@/lib/prokipImport";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function makeUniqueSlug(base: string, used: Set<string>) {
  let candidate = base || `product-${Date.now()}`;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(candidate);
  return candidate;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    const category = String(formData.get("category") ?? "").trim();
    const ageGroup = String(formData.get("age_group") ?? "").trim() || "Not specified";

    if (!files.length) {
      return Response.json({ error: "Please upload at least one CSV file." }, { status: 400 });
    }

    if (!category) {
      return Response.json({ error: "Category is required for bulk import." }, { status: 400 });
    }

    const { data: existingProducts, error: existingError } = await supabase.from("products").select("slug");
    if (existingError) throw existingError;

    const usedSlugs = new Set((existingProducts ?? []).map((item) => item.slug));
    const payload: Array<{
      slug: string;
      title: string;
      price: number;
      compare_at_price: null;
      badge: null;
      age_group: string;
      category: string;
      images: string[];
      colors: [];
      sizes: [];
      in_stock: boolean;
      rating: number;
      reviews: number;
      description: null;
    }> = [];

    for (const file of files) {
      const text = await file.text();
      const rows = parseProkipProductsCsv(text);

      for (const row of rows) {
        const slug = makeUniqueSlug(slugify(row.title), usedSlugs);
        payload.push({
          slug,
          title: row.title,
          price: row.price,
          compare_at_price: null,
          badge: null,
          age_group: ageGroup,
          category,
          images: [],
          colors: [],
          sizes: [],
          in_stock: row.inStock,
          rating: 5,
          reviews: 0,
          description: null,
        });
      }
    }

    if (!payload.length) {
      return Response.json({ error: "No valid products were found in the uploaded CSV files." }, { status: 400 });
    }

    const { data, error } = await supabase.from("products").insert(payload).select("id");
    if (error) throw error;

    return Response.json({
      imported: data?.length ?? payload.length,
      files: files.length,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
