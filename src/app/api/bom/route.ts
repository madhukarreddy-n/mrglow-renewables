import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin, requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import { defaultGstPct } from "@/lib/bom";

const createSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  make: z.string().min(1),
  unit: z.string().min(1),
  unit_price: z.number().nonnegative().nullable().optional(),
  gst_pct: z.number().min(0).max(100).optional(),
  default_qty: z.number().positive().optional(),
  sort_order: z.number().int().optional(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("bom_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("category", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid BOM item" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: last } = await supabase
    .from("bom_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("bom_items")
    .insert({
      ...parsed.data,
      gst_pct: parsed.data.gst_pct ?? defaultGstPct(parsed.data.category),
      default_qty: parsed.data.default_qty ?? 1,
      sort_order: parsed.data.sort_order ?? (last?.sort_order ?? 0) + 1,
      unit_price: parsed.data.unit_price ?? null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data }, { status: 201 });
}
