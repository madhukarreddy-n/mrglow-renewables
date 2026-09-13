import { NextResponse } from "next/server";

export function unauthorized(e: unknown) {
  const status = (e as { status?: number }).status || 401;
  const message = status === 403 ? "Forbidden" : "Unauthorized";
  return NextResponse.json({ error: message }, { status });
}
