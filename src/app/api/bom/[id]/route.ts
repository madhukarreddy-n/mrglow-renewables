import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";

const patchSchema = z.object({
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  make: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  unit_price: z.number().nonnegative().nullable().optional(),
  gst_pct: z.number().min(0).max(100).optional(),
  default_qty: z.number().positive().optional(),
  sort_order: z.number().int().optional(),
  notes: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid BOM patch" }, { status: 400 });
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("bom_items").update(parsed.data).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("bom_items")
    .update({ active: false })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: data });
}
