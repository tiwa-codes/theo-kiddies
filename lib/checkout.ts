/**
 * Server-side order pricing.
 *
 * The browser is allowed to say *what* it wants and *how many*. It is never
 * allowed to say what anything costs — the cart lives in localStorage, so any
 * price arriving in a request body is attacker-controlled. Everything here
 * prices from the catalogue.
 */
import { NIGERIAN_STATES, isValidNigerianPhone } from "@/lib/nigeria";
import type { Product } from "@/types";

export const MAX_QUANTITY_PER_LINE = 20;

export type RequestedItem = {
  slug: string;
  quantity: number;
  color?: string;
  size?: string;
};

export type PricedLine = RequestedItem & {
  title: string;
  unitPrice: number;
  lineTotal: number;
};

export type PricingResult =
  | { ok: true; lines: PricedLine[]; subtotalNaira: number; amountKobo: number }
  | { ok: false; error: string };

export class InvalidCartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCartError";
  }
}

/**
 * Narrow an untrusted request body down to the only three things we accept.
 * Anything else the browser sent (price, title, image) is discarded here.
 */
export function parseRequestedItems(raw: unknown): RequestedItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new InvalidCartError("Your cart is empty.");
  }

  return raw.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      throw new InvalidCartError("Cart contains an invalid item.");
    }

    const item = entry as Record<string, unknown>;
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    const quantity = item.quantity;

    if (!slug) {
      throw new InvalidCartError("Cart contains an item with no product.");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      throw new InvalidCartError("Cart quantities must be whole numbers of 1 or more.");
    }
    if (quantity > MAX_QUANTITY_PER_LINE) {
      throw new InvalidCartError(
        `You can order at most ${MAX_QUANTITY_PER_LINE} of one item online. Message us on WhatsApp for bulk orders.`
      );
    }

    const parsed: RequestedItem = { slug, quantity };
    if (typeof item.color === "string" && item.color) parsed.color = item.color;
    if (typeof item.size === "string" && item.size) parsed.size = item.size;
    return parsed;
  });
}

/** Price a validated cart against the catalogue. Money is summed in kobo. */
export function priceOrder(items: RequestedItem[], catalog: Product[]): PricingResult {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  const lines: PricedLine[] = [];
  let amountKobo = 0;

  for (const item of items) {
    const product = bySlug.get(item.slug);

    if (!product) {
      return { ok: false, error: `"${item.slug}" is no longer available. Please remove it from your cart.` };
    }
    if (!product.inStock) {
      return { ok: false, error: `"${product.title}" is out of stock. Please remove it from your cart.` };
    }
    if (!Number.isFinite(product.price) || product.price <= 0) {
      return { ok: false, error: `"${product.title}" is not priced yet. Please remove it from your cart.` };
    }

    const unitKobo = Math.round(product.price * 100);
    const lineKobo = unitKobo * item.quantity;
    amountKobo += lineKobo;

    lines.push({
      ...item,
      title: product.title,
      unitPrice: product.price,
      lineTotal: lineKobo / 100,
    });
  }

  return { ok: true, lines, subtotalNaira: amountKobo / 100, amountKobo };
}

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  street: string;
  altPhone?: string;
  landmark?: string;
  notes?: string;
  newsletterOptIn: boolean;
};

const FIELD_MAX_LENGTHS = {
  fullName: 150,
  email: 254,
  city: 100,
  street: 200,
  altPhone: 20,
  landmark: 200,
  notes: 500,
} as const;

function requiredString(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new InvalidCartError(`Please enter your ${label}.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new InvalidCartError(`Your ${label} is too long.`);
  }
  return trimmed;
}

function optionalString(value: unknown, label: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new InvalidCartError(`Please enter a valid ${label}.`);
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) {
    throw new InvalidCartError(`Your ${label} is too long.`);
  }
  return trimmed;
}

/**
 * Validate and narrow an untrusted checkout body down to the agreed
 * shipping-address fields. Every rejection throws InvalidCartError with a
 * message the customer can act on — this runs server-side even though the
 * form already validates, because the form can be bypassed.
 */
export function parseShippingAddress(raw: unknown): ShippingAddress {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new InvalidCartError("Delivery details are missing.");
  }
  const body = raw as Record<string, unknown>;

  const fullName = requiredString(body.fullName, "full name", FIELD_MAX_LENGTHS.fullName);

  const emailRaw = requiredString(body.email, "email address", FIELD_MAX_LENGTHS.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw)) {
    throw new InvalidCartError("Please enter a valid email address.");
  }
  const email = emailRaw.toLowerCase();

  const phone = requiredString(body.phone, "phone number", 20);
  if (!isValidNigerianPhone(phone)) {
    throw new InvalidCartError("Please enter a valid Nigerian phone number.");
  }

  const state = requiredString(body.state, "state", 40);
  if (!(NIGERIAN_STATES as readonly string[]).includes(state)) {
    throw new InvalidCartError("Please select a valid state from the list.");
  }

  const city = requiredString(body.city, "city or town", FIELD_MAX_LENGTHS.city);
  const street = requiredString(body.street, "street address", FIELD_MAX_LENGTHS.street);

  const altPhone = optionalString(body.altPhone, "alternative phone number", FIELD_MAX_LENGTHS.altPhone);
  const landmark = optionalString(body.landmark, "landmark", FIELD_MAX_LENGTHS.landmark);
  const notes = optionalString(body.notes, "delivery notes", FIELD_MAX_LENGTHS.notes);

  const address: ShippingAddress = {
    fullName,
    email,
    phone,
    state,
    city,
    street,
    newsletterOptIn: body.newsletterOptIn === true,
  };
  if (altPhone) address.altPhone = altPhone;
  if (landmark) address.landmark = landmark;
  if (notes) address.notes = notes;

  return address;
}
