import { toWhatsAppNumber } from "@/lib/nigeria";
import { isValidEmail } from "@/lib/utils";

/**
 * Where the "We'd love your feedback" QR code on the thank-you card sends
 * people. The printed URL is always /feedback; these values decide what it
 * offers, and are editable from Admin → Settings without a redeploy or reprint.
 */

export const FEEDBACK_KEYS = {
  whatsapp: "feedback_whatsapp",
  email: "feedback_email",
} as const;

export type FeedbackContacts = { whatsapp: string; email: string };

/** Used until something is saved in admin, or if the database can't be read. */
export const FEEDBACK_DEFAULTS: FeedbackContacts = {
  whatsapp: "2348140688891",
  email: "Theokiddies4@gmail.com",
};

export const FEEDBACK_WHATSAPP_MESSAGE = "Hi Theo Kiddies, here's my feedback on my order:";
export const FEEDBACK_EMAIL_SUBJECT = "Order feedback";

export function buildWhatsAppUrl(phone: string, message?: string): string | null {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
}

export function buildMailtoUrl(email: string, subject?: string): string | null {
  if (!isValidEmail(email)) return null;
  const address = email.trim();
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}

type StoredContacts = { whatsapp?: string | null; email?: string | null };

export function resolveFeedbackContacts(stored: StoredContacts): FeedbackContacts {
  return {
    whatsapp: toWhatsAppNumber(stored.whatsapp) ?? FEEDBACK_DEFAULTS.whatsapp,
    email: isValidEmail(stored.email) ? stored.email.trim() : FEEDBACK_DEFAULTS.email,
  };
}

export function feedbackLinks(contacts: FeedbackContacts): { whatsappUrl: string; emailUrl: string } {
  const resolved = resolveFeedbackContacts(contacts);
  return {
    // resolveFeedbackContacts guarantees both values are valid, so these never fall through.
    whatsappUrl: buildWhatsAppUrl(resolved.whatsapp, FEEDBACK_WHATSAPP_MESSAGE)!,
    emailUrl: buildMailtoUrl(resolved.email, FEEDBACK_EMAIL_SUBJECT)!,
  };
}

export function parseFeedbackContactsInput(
  body: unknown,
): { ok: true; contacts: FeedbackContacts } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body" };
  const { whatsapp, email } = body as Record<string, unknown>;

  const number = toWhatsAppNumber(whatsapp);
  if (!number) return { ok: false, error: "Enter a valid Nigerian WhatsApp number, e.g. 0814 068 8891" };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address" };

  return { ok: true, contacts: { whatsapp: number, email: email.trim() } };
}

/** Reads key/value rows from site_content — readSiteContent in production, a fake in tests. */
export type ReadSiteContent = (keys: string[]) => PromiseLike<{ data: unknown; error: unknown }>;

export async function getFeedbackContacts(read: ReadSiteContent): Promise<FeedbackContacts> {
  try {
    const { data, error } = await read([FEEDBACK_KEYS.whatsapp, FEEDBACK_KEYS.email]);
    if (error) throw error;

    const rows = (Array.isArray(data) ? data : []) as { key: string; value: string }[];
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return resolveFeedbackContacts({
      whatsapp: map.get(FEEDBACK_KEYS.whatsapp),
      email: map.get(FEEDBACK_KEYS.email),
    });
  } catch {
    return FEEDBACK_DEFAULTS;
  }
}
