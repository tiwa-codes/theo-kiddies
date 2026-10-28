import { requireAdmin, adminAuthResponse } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { readSiteContent } from "@/lib/site-content";
import { FEEDBACK_KEYS, getFeedbackContacts, parseFeedbackContactsInput } from "@/lib/feedback";

export const dynamic = "force-dynamic";

/** The WhatsApp number and email the thank-you card's /feedback page offers. */
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await getFeedbackContacts(readSiteContent));
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    return Response.json({ error: "Failed to load feedback contacts" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const parsed = parseFeedbackContactsInput(await req.json().catch(() => null));
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

    const { error } = await supabase.from("site_content").upsert(
      [
        { key: FEEDBACK_KEYS.whatsapp, value: parsed.contacts.whatsapp },
        { key: FEEDBACK_KEYS.email, value: parsed.contacts.email },
      ],
      { onConflict: "key" },
    );
    if (error) throw error;

    return Response.json(parsed.contacts);
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    const message = err instanceof Error ? err.message : "Failed to save feedback contacts";
    return Response.json({ error: message }, { status: 500 });
  }
}
