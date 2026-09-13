import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["admin", "employee"]).default("employee"),
  password: z.string().min(8),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return unauthorized(e);
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee payload" }, { status: 400 });
  }

  const service = createServiceSupabase();
  const { data: created, error: authError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name },
  });
  if (authError || !created.user) {
    return NextResponse.json({ error: authError?.message || "Could not create auth user" }, { status: 400 });
  }

  const { data, error } = await service
    .from("employees")
    .insert({
      auth_user_id: created.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
    })
    .select("*")
    .single();

  if (error) {
    await service.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ employee: data }, { status: 201 });
}
