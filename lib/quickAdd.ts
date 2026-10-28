import type { Product } from "@/types";

export type QuickAddChoice =
  | { kind: "add"; colorId?: string; sizeId?: string }
  | { kind: "choose" }
  | { kind: "unavailable" };

/**
 * What the product card's quick-add button may do. It only adds straight to
 * the cart when there is nothing to pick; with more than one colour or size the
 * shopper must choose on the product page, otherwise we'd silently send the
 * first size and get wrong-size orders.
 */
export function quickAddChoice(product: Pick<Product, "inStock" | "colors" | "sizes">): QuickAddChoice {
  if (!product.inStock) return { kind: "unavailable" };
  if (product.colors.length > 1 || product.sizes.length > 1) return { kind: "choose" };
  return { kind: "add", colorId: product.colors[0]?.id, sizeId: product.sizes[0]?.id };
}
