import { describe, expect, it } from "vitest";
import { SOCIAL_HANDLE, socialLinks } from "@/lib/socials";

describe("socialLinks", () => {
  it("lists the accounts printed on the thank-you card, in order", () => {
    expect(socialLinks.map((s) => s.name)).toEqual(["Instagram", "Facebook", "TikTok"]);
  });

  it("points every link at the theokiddies account over https", () => {
    for (const s of socialLinks) {
      expect(s.href).toMatch(/^https:\/\/(www\.)?(instagram|facebook|tiktok)\.com\/@?theokiddies$/i);
    }
  });

  it("shows the real handle", () => {
    expect(SOCIAL_HANDLE).toBe("@theokiddies");
  });
});
