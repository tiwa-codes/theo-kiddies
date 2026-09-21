import { getProductsByIds } from "@/lib/products";

export const dynamic = "force-dynamic";

// GET /api/wishlist?ids=a,b,c — published products for a browser's saved ids.
// Public and read-only: it returns only what the storefront already shows.
export async function GET(req: Request) {
  const ids = new URL(req.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  try {
    return Response.json(await getProductsByIds(ids));
  } catch (err) {
    console.error("Wishlist lookup error:", err);
    return Response.json({ error: "Couldn't load your wishlist." }, { status: 500 });
  }
}
