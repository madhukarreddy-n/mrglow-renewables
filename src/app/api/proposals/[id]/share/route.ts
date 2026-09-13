import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import { canTransition, isLeadStatus } from "@/lib/workflow";
import { proposalSharedEmail, sendEmail } from "@/lib/email/send";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: proposal, error } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
  if (error || !proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: lead } = await supabase.from("leads").select("*").eq("id", proposal.lead_id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.archived_at) {
    return NextResponse.json({ error: "Restore the lead before sharing a proposal." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { error: shareErr } = await supabase.from("proposals").update({ shared_at: now }).eq("id", id);
  if (shareErr) return NextResponse.json({ error: shareErr.message }, { status: 400 });

  if (isLeadStatus(lead.status) && canTransition(lead.status, "proposal_shared")) {
    await supabase.from("leads").update({ status: "proposal_shared" }).eq("id", lead.id);
    await supabase.from("status_history").insert({
      lead_id: lead.id,
      from_status: lead.status,
      to_status: "proposal_shared",
      changed_by_employee_id: employee.id,
      note: "Proposal shared with customer",
    });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${origin.replace(/\/$/, "")}/p/${proposal.share_token}`;
  if (lead.email) {
    await sendEmail({ to: lead.email, ...proposalSharedEmail({ name: lead.name, url }) });
  }

  return NextResponse.json({ ok: true, url, share_token: proposal.share_token });
}
