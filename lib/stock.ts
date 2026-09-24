/**
 * Validate a stock quantity arriving from the admin form.
 *
 * `undefined`/`null` mean "the client didn't send it" — callers leave stock
 * alone on update and default to 0 on create. 0 itself means "stock isn't
 * counted for this product" (see decrement_product_stock in schema.sql), not
 * "sold out".
 */
const MAX_STOCK = 1_000_000;
const MESSAGE = `Stock quantity must be a whole number from 0 to ${MAX_STOCK.toLocaleString("en-NG")}.`;

export type StockParse = { ok: true; value: number | undefined } | { ok: false; error: string };

export function parseStockQuantity(raw: unknown): StockParse {
  if (raw === undefined || raw === null) return { ok: true, value: undefined };

  const isNumeric =
    typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "");
  if (!isNumeric) return { ok: false, error: MESSAGE };

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > MAX_STOCK) {
    return { ok: false, error: MESSAGE };
  }
  return { ok: true, value };
}
