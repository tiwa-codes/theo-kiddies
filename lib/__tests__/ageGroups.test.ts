import { describe, expect, it } from "vitest";
import { AGE_BANDS, AGE_GROUPS, ageGroupSlug, resolveAgeSlug } from "@/lib/ageGroups";

describe("AGE_GROUPS", () => {
  it("follows UK kids' sizing: baby months, then one bracket per year to 15-16", () => {
    expect(AGE_GROUPS.slice(0, 6)).toEqual([
      "0-3 Months",
      "3-6 Months",
      "6-9 Months",
      "9-12 Months",
      "12-18 Months",
      "18-24 Months",
    ]);
    expect(AGE_GROUPS[6]).toBe("2-3 Years");
    expect(AGE_GROUPS[AGE_GROUPS.length - 1]).toBe("15-16 Years");
    expect(AGE_GROUPS).toHaveLength(20);
  });

  it("has no duplicate labels or slugs", () => {
    expect(new Set(AGE_GROUPS).size).toBe(AGE_GROUPS.length);
    expect(new Set(AGE_GROUPS.map(ageGroupSlug)).size).toBe(AGE_GROUPS.length);
  });
});

describe("AGE_BANDS", () => {
  it("covers every age group exactly once, in order", () => {
    expect(AGE_BANDS.flatMap((band) => [...band.ages])).toEqual([...AGE_GROUPS]);
  });
});

describe("ageGroupSlug", () => {
  it("makes URL-safe slugs", () => {
    expect(ageGroupSlug("0-3 Months")).toBe("0-3-months");
    expect(ageGroupSlug("15-16 Years")).toBe("15-16-years");
  });
});

describe("resolveAgeSlug", () => {
  it("resolves a single bracket to just that age group", () => {
    expect(resolveAgeSlug("3-4-years")).toEqual({ title: "3-4 Years", ages: ["3-4 Years"] });
  });

  it("resolves a band to all of its age groups", () => {
    const toddler = resolveAgeSlug("toddler");
    expect(toddler?.ages).toEqual(["2-3 Years", "3-4 Years"]);
    expect(toddler?.title).toContain("Toddler");
  });

  it("returns null for anything that isn't an age slug", () => {
    expect(resolveAgeSlug("clothing")).toBeNull();
    expect(resolveAgeSlug("0-12-months")).toBeNull(); // the old bracket
  });
});
