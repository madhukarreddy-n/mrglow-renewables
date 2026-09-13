import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const body = await req.json();
  const supabase = await createServerSupabase();
  const { data: proposal } = await supabase.from("proposals").select("id").eq("id", id).maybeSingle();
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.intent === "sign") {
    const filename = String(body.filename || "photo.jpg").replace(/[^\w.\-]+/g, "_");
    const path = `${id}/${crypto.randomUUID()}-${filename}`;
    const service = createServiceSupabase();
    const { data, error } = await service.storage.from("proposal-photos").createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Could not sign upload" }, { status: 400 });
    }
    return NextResponse.json({
      storage_path: path,
      token: data.token,
      signedUrl: data.signedUrl,
      path: data.path,
    });
  }

  const storage_path = String(body.storage_path || "");
  if (!storage_path.startsWith(`${id}/`)) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("proposal_photos")
    .insert({
      proposal_id: id,
      storage_path,
      caption: body.caption || null,
      uploaded_by_employee_id: employee.id,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ photo: data }, { status: 201 });
}
