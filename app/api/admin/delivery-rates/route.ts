import { requireAdmin, adminAuthResponse } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { NIGERIAN_STATES } from "@/lib/nigeria";

export const dynamic = "force-dynamic";

// GET /api/admin/delivery-rates — list all 37 states
export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from("delivery_rates")
      .select("*")
      .order("state", { ascending: true });

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/admin/delivery-rates — update one state's fee/active.
// All 37 rows already exist from the schema seed, so this updates rather
// than inserts; an unrecognised state is rejected rather than silently
// creating a new row that would never match a real checkout.
export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const state = String(body.state ?? "");
    if (!(NIGERIAN_STATES as readonly string[]).includes(state)) {
      return Response.json({ error: "Unknown state." }, { status: 400 });
    }

    const fee = Number(body.fee);
    if (!Number.isFinite(fee) || fee < 0) {
      return Response.json({ error: "Fee must be a non-negative number." }, { status: 400 });
    }

    const active = Boolean(body.active);

    const { data, error } = await supabase
      .from("delivery_rates")
      .update({ fee, active, updated_at: new Date().toISOString() })
      .eq("state", state)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const denied = adminAuthResponse(err);
    if (denied) return denied;
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
