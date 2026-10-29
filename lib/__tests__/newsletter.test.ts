import { describe, expect, it } from "vitest";
import { mergeSubscribers, parseSubscribeInput, toSubscribersCsv } from "@/lib/newsletter";

describe("parseSubscribeInput", () => {
  it("accepts a valid email, normalising case and spaces", () => {
    expect(parseSubscribeInput({ email: "  Ada@Example.COM ", source: "feedback" })).toEqual({
      ok: true,
      email: "ada@example.com",
      source: "feedback",
    });
    expect(parseSubscribeInput({ email: "ada@example.com", source: "footer" })).toEqual({
      ok: true,
      email: "ada@example.com",
      source: "footer",
    });
  });

  it("rejects an invalid email with a readable message", () => {
    const result = parseSubscribeInput({ email: "not-an-email", source: "footer" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/email/i);
  });

  it("rejects an unknown source so the list stays clean", () => {
    expect(parseSubscribeInput({ email: "ada@example.com", source: "somewhere" }).ok).toBe(false);
    expect(parseSubscribeInput({ email: "ada@example.com" }).ok).toBe(false);
  });

  it("rejects a body that is not an object", () => {
    expect(parseSubscribeInput(null).ok).toBe(false);
    expect(parseSubscribeInput("ada@example.com").ok).toBe(false);
  });
});

describe("mergeSubscribers", () => {
  it("combines signups and checkout opt-ins into one list, one row per email", () => {
    const merged = mergeSubscribers(
      [
        { email: "ada@example.com", source: "feedback", consented_at: "2026-10-20T10:00:00.000Z" },
        { email: "bola@example.com", source: "footer", consented_at: "2026-10-25T10:00:00.000Z" },
      ],
      [
        { email: "ADA@example.com", newsletter_opt_in_at: "2026-10-01T09:00:00.000Z" },
        { email: "ada@example.com", newsletter_opt_in_at: "2026-10-15T09:00:00.000Z" },
        { email: "chi@example.com", newsletter_opt_in_at: "2026-10-10T09:00:00.000Z" },
      ],
    );

    expect(merged).toEqual([
      { email: "bola@example.com", sources: ["footer"], subscribedAt: "2026-10-25T10:00:00.000Z" },
      { email: "chi@example.com", sources: ["checkout"], subscribedAt: "2026-10-10T09:00:00.000Z" },
      // Earliest consent wins; sources listed once each, alphabetically.
      { email: "ada@example.com", sources: ["checkout", "feedback"], subscribedAt: "2026-10-01T09:00:00.000Z" },
    ]);
  });

  it("skips checkout rows with no opt-in date rather than inventing one", () => {
    expect(mergeSubscribers([], [{ email: "ada@example.com", newsletter_opt_in_at: null }])).toEqual([]);
  });

  it("returns an empty list when there is nothing yet", () => {
    expect(mergeSubscribers([], [])).toEqual([]);
  });
});

describe("toSubscribersCsv", () => {
  it("writes a header and one line per subscriber", () => {
    const csv = toSubscribersCsv([
      { email: "ada@example.com", sources: ["checkout", "feedback"], subscribedAt: "2026-10-01T09:00:00.000Z" },
    ]);
    expect(csv).toBe(
      "Email,Signed up from,Subscribed at\r\nada@example.com,checkout; feedback,2026-10-01T09:00:00.000Z\r\n",
    );
  });

  it("quotes values containing commas or quotes", () => {
    const csv = toSubscribersCsv([{ email: 'a,"b"@example.com', sources: ["footer"], subscribedAt: "2026-10-01T09:00:00.000Z" }]);
    expect(csv).toContain('"a,""b""@example.com"');
  });

  it("neutralises values a spreadsheet would run as a formula", () => {
    const csv = toSubscribersCsv([{ email: "=HYPERLINK(1)@x.com", sources: ["footer"], subscribedAt: "2026-10-01T09:00:00.000Z" }]);
    expect(csv).toContain("'=HYPERLINK(1)@x.com");
    expect(csv).not.toContain(",=HYPERLINK");
  });
});
