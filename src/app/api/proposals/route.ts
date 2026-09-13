import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import { canCreateProposal, isLeadStatus } from "@/lib/workflow";
import { formatEstimateNumber, parseProposalSnapshot, proposalTotals } from "@/lib/bom";

const lineSchema = z.object({
  bom_item_id: z.string().uuid().optional().nullable(),
  category: z.string().min(1),
  description: z.string().min(1),
  make: z.string().min(1),
  unit: z.string().min(1),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
  gst_pct: z.number().min(0).max(100),
});

const schema = z.object({
  lead_id: z.string().uuid(),
  price_inr: z.number().nonnegative().optional(),
  system_size_kwp: z.number().positive().optional().nullable(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1),
});

export async function GET() {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, leads(id, name, phone, city, status)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ proposals: data || [] });
}

export async function POST(req: NextRequest) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid proposal payload" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", parsed.data.lead_id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.archived_at) {
    return NextResponse.json({ error: "Restore the lead before generating a proposal." }, { status: 409 });
  }
  if (!isLeadStatus(lead.status) || !canCreateProposal(lead.status)) {
    return NextResponse.json(
      { error: "Contact the customer first, then generate a proposal." },
      { status: 409 },
    );
  }

  const lines = parsed.data.lines;
  const totals = proposalTotals(lines);
  const price = parsed.data.price_inr ?? totals.total;

  const { data: forLead } = await supabase
    .from("proposals")
    .select("estimate_serial, version")
    .eq("lead_id", lead.id);
  const { data: latestSerial } = await supabase
    .from("proposals")
    .select("estimate_serial")
    .not("estimate_serial", "is", null)
    .order("estimate_serial", { ascending: false })
    .limit(1);

  const existingSerial = (forLead || []).map((row) => row.estimate_serial).find((n) => n != null);
  const serial = existingSerial ?? ((latestSerial?.[0]?.estimate_serial as number | null) || 0) + 1;
  const version =
    existingSerial != null
      ? Math.max(0, ...(forLead || []).map((row) => Number(row.version) || 1)) + 1
      : 1;
  const estimate_number = formatEstimateNumber(Number(serial), version);

  const snapshot = parseProposalSnapshot({
    estimate_number,
    notes: parsed.data.notes,
    lines,
  });

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      lead_id: parsed.data.lead_id,
      created_by_employee_id: employee.id,
      price_inr: price,
      system_size_kwp: parsed.data.system_size_kwp ?? lead.estimated_system_kwp ?? null,
      components: snapshot,
      estimate_serial: serial,
      estimate_number,
      version,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ proposal: data }, { status: 201 });
}
