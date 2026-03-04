import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/admin/products — list all products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/admin/products — create a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Auto-generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        slug: body.slug,
        title: body.title,
        price: Number(body.price),
        compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
        badge: body.badge || null,
        age_group: body.age_group,
        category: body.category,
        images: body.images ?? [],
        colors: body.colors ?? [],
        sizes: body.sizes ?? [],
        in_stock: body.in_stock ?? true,
        rating: body.rating ? Number(body.rating) : 5.0,
        reviews: body.reviews ? Number(body.reviews) : 0,
        description: body.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
