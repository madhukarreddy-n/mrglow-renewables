import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireApiPermission } from "@/lib/auth/api";
import { deleteObject } from "@/lib/storage";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; designId: string }> },
) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_WRITE);
  if (auth.response) return auth.response;
  const { id, designId } = await params;
  const design = await prisma.leadDesign.findFirst({ where: { id: designId, leadId: id } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = await prisma.leadDesign.update({
    where: { id: designId },
    data: {
      includeInProposal:
        typeof body.includeInProposal === "boolean" ? body.includeInProposal : undefined,
      caption: typeof body.caption === "string" ? body.caption : undefined,
    },
  });
  return NextResponse.json({ design: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; designId: string }> },
) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_WRITE);
  if (auth.response) return auth.response;
  const { id, designId } = await params;
  const design = await prisma.leadDesign.findFirst({ where: { id: designId, leadId: id } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteObject(design.fileKey);
  await prisma.leadDesign.delete({ where: { id: designId } });
  return NextResponse.json({ ok: true });
}
