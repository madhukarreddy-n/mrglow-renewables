import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";

export async function GET(req: NextRequest) {
  try {
    await requireEmployee();
  } catch (e) {
    const status = (e as { status?: number }).status || 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
  const supabase = await createServerSupabase();
  const status = req.nextUrl.searchParams.get("status");
  const assignedTo = req.nextUrl.searchParams.get("assignedTo");
  const archived = req.nextUrl.searchParams.get("archived") === "1";
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  q = archived ? q.not("archived_at", "is", null) : q.is("archived_at", null);
  if (status) q = q.eq("status", status);
  if (assignedTo) q = q.eq("assigned_employee_id", assignedTo);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}
