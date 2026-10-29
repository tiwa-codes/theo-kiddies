import { isValidEmail } from "@/lib/utils";

/**
 * Newsletter signups. Two places collect them: the dedicated signup box
 * (on /feedback and in the footer, stored in newsletter_subscribers) and the
 * opt-in tick-box at checkout (stored on the order). The admin list merges both.
 */

export const NEWSLETTER_SOURCES = ["feedback", "footer"] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

export function parseSubscribeInput(
  body: unknown,
): { ok: true; email: string; source: NewsletterSource } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body" };
  const { email, source } = body as Record<string, unknown>;

  if (!isValidEmail(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!NEWSLETTER_SOURCES.includes(source as NewsletterSource)) return { ok: false, error: "Invalid signup source" };

  return { ok: true, email: email.trim().toLowerCase(), source: source as NewsletterSource };
}

export type SubscriberRow = { email: string; source: string; consented_at: string };
export type CheckoutOptInRow = { email: string; newsletter_opt_in_at: string | null };
export type Subscriber = { email: string; sources: string[]; subscribedAt: string };

/** One row per email (case-insensitive), earliest consent date, newest subscribers first. */
export function mergeSubscribers(signups: SubscriberRow[], checkoutOptIns: CheckoutOptInRow[]): Subscriber[] {
  const byEmail = new Map<string, { sources: Set<string>; subscribedAt: string }>();

  const add = (rawEmail: string, source: string, at: string) => {
    const email = rawEmail.trim().toLowerCase();
    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, { sources: new Set([source]), subscribedAt: at });
      return;
    }
    existing.sources.add(source);
    if (Date.parse(at) < Date.parse(existing.subscribedAt)) existing.subscribedAt = at;
  };

  for (const row of signups) add(row.email, row.source, row.consented_at);
  for (const row of checkoutOptIns) {
    if (row.newsletter_opt_in_at) add(row.email, "checkout", row.newsletter_opt_in_at);
  }

  return [...byEmail.entries()]
    .map(([email, { sources, subscribedAt }]) => ({ email, sources: [...sources].sort(), subscribedAt }))
    .sort((a, b) => Date.parse(b.subscribedAt) - Date.parse(a.subscribedAt));
}

function csvCell(value: string): string {
  // A cell starting with one of these is run as a formula by Excel/Sheets.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toSubscribersCsv(subscribers: Subscriber[]): string {
  const lines = [
    ["Email", "Signed up from", "Subscribed at"],
    ...subscribers.map((s) => [s.email, s.sources.join("; "), s.subscribedAt]),
  ];
  return lines.map((cells) => cells.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
