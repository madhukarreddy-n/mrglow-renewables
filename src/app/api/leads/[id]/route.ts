import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import { removeLeadStorage } from "@/lib/storage-cleanup";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch (e) {
    const status = (e as { status?: number }).status || 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error || !lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: history } = await supabase
    .from("status_history")
    .select("*")
    .eq("lead_id", id)
    .order("changed_at", { ascending: true });
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ lead, history: history || [], proposals: proposals || [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const key of [
    "name",
    "phone",
    "email",
    "address",
    "city",
    "site_type",
    "monthly_bill_inr",
    "estimated_system_kwp",
    "estimated_annual_savings_inr",
  ]) {
    if (key in body) patch[key] = body[key];
  }
  if ("assigned_employee_id" in body) {
    if (employee.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    patch.assigned_employee_id = body.assigned_employee_id;
  }
  if ("archived" in body) {
    patch.archived_at = body.archived ? new Date().toISOString() : null;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const service = createServiceSupabase();
  const { data: lead } = await service.from("leads").select("id").eq("id", id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: proposals } = await service.from("proposals").select("id").eq("lead_id", id);
  const proposalIds = (proposals || []).map((row) => row.id);
  await removeLeadStorage(service, id, proposalIds);

  const { error } = await service.from("leads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
