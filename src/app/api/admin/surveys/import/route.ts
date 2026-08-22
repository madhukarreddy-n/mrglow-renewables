import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireApiPermission } from "@/lib/auth/api";
import { parseSurveyWorkbook } from "@/lib/survey/parse-workbook";

export async function POST(req: NextRequest) {
  const auth = await requireApiPermission(PERMISSIONS.SURVEYS_WRITE);
  if (auth.response) return auth.response;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload an Excel file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const mapped = parseSurveyWorkbook(buf);
  return NextResponse.json({ mapped, fileName: file.name });
}
