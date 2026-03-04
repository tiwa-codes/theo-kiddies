import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

// PUT /api/admin/products/[id] — update a product
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    if (body.title && !body.slug) {
      body.slug = slugify(body.title);
    }

    const { data, error } = await supabase
      .from("products")
      .update({
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
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
