import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

async function employeeCount() {
  const supabase = createServiceSupabase();
  const { count, error } = await supabase.from("employees").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    const count = await employeeCount();
    return NextResponse.json({ needsSetup: count === 0 });
  } catch (e) {
    const err = e as { message?: string };
    return NextResponse.json(
      { needsSetup: false, error: err.message || "Cannot reach Supabase" },
      { status: 503 },
    );
  }
}

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  setup_secret: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`setup:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email and password (8+ characters) are required." }, { status: 400 });
  }

  const expected = process.env.SETUP_SECRET;
  if (expected && parsed.data.setup_secret !== expected) {
    return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
  }

  try {
    const count = await employeeCount();
    if (count > 0) {
      return NextResponse.json({ error: "Setup already completed. Sign in or ask an admin to invite you." }, { status: 409 });
    }

    const service = createServiceSupabase();
    const { data: created, error: authError } = await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { name: parsed.data.name },
    });
    if (authError || !created.user) {
      return NextResponse.json({ error: authError?.message || "Could not create login" }, { status: 400 });
    }

    const { error } = await service.from("employees").insert({
      auth_user_id: created.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: "admin",
    });
    if (error) {
      await service.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
