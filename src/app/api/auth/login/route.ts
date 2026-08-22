import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const allowed = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000).catch(() => true);
  if (!allowed) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: String(email || "").toLowerCase() } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const match = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.json({ ok: true });
}
