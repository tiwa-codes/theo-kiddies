/**
 * The one list of age brackets — nav, filters, admin form, category pages
 * and sitemap all derive from this.
 *
 * Follows UK kids' clothing sizing: babies in months (they outgrow a size
 * every few months), then one bracket per year. A label like "3-4 Years"
 * is what UK brands call "age 4" (up to 4).
 */
export const AGE_GROUPS = [
  "0-3 Months",
  "3-6 Months",
  "6-9 Months",
  "9-12 Months",
  "12-18 Months",
  "18-24 Months",
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
  "8-9 Years",
  "9-10 Years",
  "10-11 Years",
  "11-12 Years",
  "12-13 Years",
  "13-14 Years",
  "14-15 Years",
  "15-16 Years",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export function ageGroupSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

/** Broader groupings for places where 20 separate entries wouldn't fit (homepage tiles, menus). */
export const AGE_BANDS = [
  { slug: "baby", title: "Baby", range: "0-24 Months", note: "Soft layers for newborns", ages: AGE_GROUPS.slice(0, 6) },
  { slug: "toddler", title: "Toddler", range: "2-4 Years", note: "Built for everyday play", ages: AGE_GROUPS.slice(6, 8) },
  { slug: "kids", title: "Kids", range: "4-8 Years", note: "School-ready essentials", ages: AGE_GROUPS.slice(8, 12) },
  { slug: "older-kids", title: "Older Kids", range: "8-16 Years", note: "Style with confidence", ages: AGE_GROUPS.slice(12) },
] as const;

/** Resolve a /category/<slug> that is an age bracket or band; null if it's neither. */
export function resolveAgeSlug(slug: string): { title: string; ages: readonly string[] } | null {
  const band = AGE_BANDS.find((b) => b.slug === slug);
  if (band) return { title: `${band.title} ${band.range}`, ages: band.ages };

  const label = AGE_GROUPS.find((a) => ageGroupSlug(a) === slug);
  return label ? { title: label, ages: [label] } : null;
}
