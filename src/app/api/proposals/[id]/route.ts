import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, leads(id, name, phone, email, city, address, site_type, status, estimated_system_kwp)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: photos } = await supabase
    .from("proposal_photos")
    .select("*")
    .eq("proposal_id", id)
    .order("uploaded_at", { ascending: true });
  return NextResponse.json({ proposal: data, photos: photos || [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if ("price_inr" in body) patch.price_inr = body.price_inr;
  if ("system_size_kwp" in body) patch.system_size_kwp = body.system_size_kwp;
  if ("components" in body) patch.components = body.components;
  if ("pdf_storage_path" in body) patch.pdf_storage_path = body.pdf_storage_path;

  const supabase = await createServerSupabase();
  const { data: existing } = await supabase.from("proposals").select("shared_at").eq("id", id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.shared_at) {
    const locked = Object.keys(patch).filter((key) => key !== "pdf_storage_path");
    if (locked.length) {
      return NextResponse.json(
        { error: "Shared proposals cannot change price or BOM. Photos can still be added." },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase.from("proposals").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ proposal: data });
}
