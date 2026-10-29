import { requireAdmin, adminAuthResponse } from "@/lib/admin-auth";
import { toSubscribersCsv } from "@/lib/newsletter";
import { listSubscribers } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

/** Downloads the newsletter list as a spreadsheet (CSV). */
export async function GET() {
  try {
    await requireAdmin();
    const csv = toSubscribersCsv(await listSubscribers());
    const date = new Date().toISOString().slice(0, 10);
    // The BOM makes Excel open the file as UTF-8.
    return new Response("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="theo-kiddies-subscribers-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    console.error("Subscriber export failed:", err);
    return Response.json({ error: "Failed to export subscribers" }, { status: 500 });
  }
}
