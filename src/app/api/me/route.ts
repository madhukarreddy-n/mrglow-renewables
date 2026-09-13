import { NextResponse } from "next/server";
import { getSessionEmployee } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const employee = await getSessionEmployee();
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ employee });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
