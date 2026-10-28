import { describe, expect, it } from "vitest";
import {
  FEEDBACK_DEFAULTS,
  FEEDBACK_KEYS,
  buildMailtoUrl,
  buildWhatsAppUrl,
  feedbackLinks,
  getFeedbackContacts,
  parseFeedbackContactsInput,
  resolveFeedbackContacts,
} from "@/lib/feedback";

describe("buildWhatsAppUrl", () => {
  it("builds a wa.me link with the message already typed", () => {
    expect(buildWhatsAppUrl("08140688891", "Hi, feedback: 5/5")).toBe(
      "https://wa.me/2348140688891?text=Hi%2C%20feedback%3A%205%2F5",
    );
  });

  it("omits the text parameter when there is no message", () => {
    expect(buildWhatsAppUrl("+234 814 068 8891")).toBe("https://wa.me/2348140688891");
  });

  it("returns null for a number WhatsApp could not open", () => {
    expect(buildWhatsAppUrl("15551234567")).toBeNull();
  });
});

describe("buildMailtoUrl", () => {
  it("builds a mailto link with an encoded subject", () => {
    expect(buildMailtoUrl("Theokiddies4@gmail.com", "Order feedback")).toBe(
      "mailto:Theokiddies4@gmail.com?subject=Order%20feedback",
    );
  });

  it("trims spaces and omits the subject when there is none", () => {
    expect(buildMailtoUrl("  Theokiddies4@gmail.com ")).toBe("mailto:Theokiddies4@gmail.com");
  });

  it("returns null for an invalid address", () => {
    expect(buildMailtoUrl("not-an-email")).toBeNull();
  });
});

describe("resolveFeedbackContacts", () => {
  it("uses the admin values, normalised, when they are valid", () => {
    expect(resolveFeedbackContacts({ whatsapp: "0805 855 7281", email: " sales@theokiddies.com " })).toEqual({
      whatsapp: "2348058557281",
      email: "sales@theokiddies.com",
    });
  });

  it("falls back to the defaults for missing, blank or invalid values", () => {
    for (const stored of [{}, { whatsapp: null, email: null }, { whatsapp: "", email: "  " }, { whatsapp: "junk", email: "junk" }]) {
      expect(resolveFeedbackContacts(stored)).toEqual(FEEDBACK_DEFAULTS);
    }
  });

  it("defaults to the numbers given for the thank-you cards", () => {
    expect(FEEDBACK_DEFAULTS).toEqual({ whatsapp: "2348140688891", email: "Theokiddies4@gmail.com" });
  });
});

describe("feedbackLinks", () => {
  it("produces both links with the pre-typed message and subject", () => {
    const links = feedbackLinks(FEEDBACK_DEFAULTS);
    expect(links.whatsappUrl).toMatch(/^https:\/\/wa\.me\/2348140688891\?text=/);
    expect(links.emailUrl).toBe("mailto:Theokiddies4@gmail.com?subject=Order%20feedback");
  });
});

describe("parseFeedbackContactsInput", () => {
  it("accepts and normalises valid input", () => {
    expect(parseFeedbackContactsInput({ whatsapp: "+234 814 068 8891", email: " Theokiddies4@gmail.com " })).toEqual({
      ok: true,
      contacts: { whatsapp: "2348140688891", email: "Theokiddies4@gmail.com" },
    });
  });

  it("rejects an invalid WhatsApp number with a readable message", () => {
    const result = parseFeedbackContactsInput({ whatsapp: "123", email: "a@b.com" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/WhatsApp/);
  });

  it("rejects an invalid email with a readable message", () => {
    const result = parseFeedbackContactsInput({ whatsapp: "08140688891", email: "nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/email/i);
  });

  it("rejects a body that is not an object", () => {
    expect(parseFeedbackContactsInput(null).ok).toBe(false);
    expect(parseFeedbackContactsInput("x").ok).toBe(false);
  });
});

/** Stand-in for readSiteContent: records which keys were asked for. */
function fakeRead(result: { data: unknown; error: unknown }, seen?: { keys?: string[] }) {
  return (keys: string[]) => {
    if (seen) seen.keys = keys;
    return Promise.resolve(result);
  };
}

describe("getFeedbackContacts", () => {
  it("reads the two feedback keys from site_content", async () => {
    const seen: { keys?: string[] } = {};
    const contacts = await getFeedbackContacts(
      fakeRead(
        {
          data: [
            { key: FEEDBACK_KEYS.whatsapp, value: "08058557281" },
            { key: FEEDBACK_KEYS.email, value: "sales@theokiddies.com" },
          ],
          error: null,
        },
        seen,
      ),
    );
    expect(seen.keys).toEqual([FEEDBACK_KEYS.whatsapp, FEEDBACK_KEYS.email]);
    expect(contacts).toEqual({ whatsapp: "2348058557281", email: "sales@theokiddies.com" });
  });

  it("falls back to the defaults when nothing is stored yet", async () => {
    expect(await getFeedbackContacts(fakeRead({ data: [], error: null }))).toEqual(FEEDBACK_DEFAULTS);
  });

  it("falls back to the defaults when the database errors, so the QR never dead-ends", async () => {
    expect(await getFeedbackContacts(fakeRead({ data: null, error: new Error("down") }))).toEqual(FEEDBACK_DEFAULTS);
  });

  it("falls back to the defaults when the read itself throws", async () => {
    const read = () => Promise.reject(new Error("network"));
    expect(await getFeedbackContacts(read)).toEqual(FEEDBACK_DEFAULTS);
  });
});
