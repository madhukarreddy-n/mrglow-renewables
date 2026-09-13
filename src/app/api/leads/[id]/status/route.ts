import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { canTransition, isLeadStatus } from "@/lib/workflow";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch (e) {
    const status = (e as { status?: number }).status || 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
  const { id } = await params;
  const body = await req.json();
  const to = String(body.status || "");
  if (!isLeadStatus(to)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error || !lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lead.archived_at) {
    return NextResponse.json({ error: "Restore the lead before changing status." }, { status: 409 });
  }
  if (!canTransition(lead.status, to)) {
    return NextResponse.json(
      { error: `Cannot move from ${lead.status} to ${to}` },
      { status: 409 },
    );
  }

  const { error: upErr } = await supabase.from("leads").update({ status: to }).eq("id", id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  await supabase.from("status_history").insert({
    lead_id: id,
    from_status: lead.status,
    to_status: to,
    changed_by_employee_id: employee.id,
    note: body.note || null,
  });

  return NextResponse.json({ ok: true, status: to });
}
