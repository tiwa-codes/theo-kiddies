/**
 * Nigerian states and phone validation, shared between the checkout form,
 * server-side address validation, and the seeded `delivery_rates` table.
 * Must exactly match the primary keys seeded in supabase/schema.sql.
 */

export const NIGERIAN_STATES = Object.freeze([
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const);

export type NigerianState = (typeof NIGERIAN_STATES)[number];

/**
 * Validates a Nigerian mobile number in local (0803...), international
 * (+234803...) or bare international (234803...) format. Normalises to the
 * 10-digit subscriber number before checking it starts with a valid mobile
 * prefix digit (7, 8 or 9 — every NG mobile network's prefixes start this way).
 */
export function isValidNigerianPhone(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const digits = value.trim().replace(/[\s-]/g, "");

  let subscriber: string;
  if (/^\+234\d{10}$/.test(digits)) {
    subscriber = digits.slice(4);
  } else if (/^234\d{10}$/.test(digits)) {
    subscriber = digits.slice(3);
  } else if (/^0\d{10}$/.test(digits)) {
    subscriber = digits.slice(1);
  } else {
    return false;
  }

  return /^[789]\d{9}$/.test(subscriber);
}
