import { NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireApiPermission } from "@/lib/auth/api";
import { surveyTemplateBuffer } from "@/lib/survey/parse-workbook";

export async function GET() {
  const auth = await requireApiPermission(PERMISSIONS.SURVEYS_READ);
  if (auth.response) return auth.response;
  const buf = surveyTemplateBuffer();
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="mrglow-site-survey-template.xlsx"',
    },
  });
}
