import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import seed from "@/content/bom-seed.json";

type SeedRow = {
  category: string;
  description: string;
  make: string;
  unit: string;
  unit_price: number | null;
  default_qty: number;
  gst_pct: number;
  sort_order: number;
  notes: string;
};

export async function POST() {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const supabase = await createServerSupabase();
  const { count } = await supabase.from("bom_items").select("id", { count: "exact", head: true });
  if ((count || 0) > 0) {
    return NextResponse.json({ error: "BOM already has items. Clear the table to re-seed." }, { status: 409 });
  }

  const rows = (seed as SeedRow[]).map((row) => ({
    category: row.category,
    description: row.description,
    make: row.make,
    unit: row.unit,
    unit_price: row.unit_price,
    default_qty: row.default_qty,
    gst_pct: row.gst_pct,
    sort_order: row.sort_order,
    notes: row.notes || null,
    active: true,
  }));

  const { data, error } = await supabase.from("bom_items").insert(rows).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, inserted: data?.length || 0 }, { status: 201 });
}
