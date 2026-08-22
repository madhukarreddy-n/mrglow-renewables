import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireApiPermission } from "@/lib/auth/api";
import { putObject } from "@/lib/storage";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_READ);
  if (auth.response) return auth.response;
  const { id } = await params;
  const designs = await prisma.leadDesign.findMany({
    where: { leadId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ designs });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_WRITE);
  if (auth.response) return auth.response;
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
  const last = await prisma.leadDesign.findFirst({
    where: { leadId: id },
    orderBy: { sortOrder: "desc" },
  });
  let order = last ? last.sortOrder + 1 : 0;
  const created = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) continue;
    const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const key = `designs/${id}/${randomUUID()}.${ext}`;
    await putObject(key, buf, file.type);
    created.push(
      await prisma.leadDesign.create({
        data: {
          leadId: id,
          fileKey: key,
          fileName: file.name.slice(0, 180),
          sortOrder: order++,
          includeInProposal: true,
        },
      }),
    );
  }
  await prisma.leadActivity.create({
    data: {
      leadId: id,
      type: "DESIGN_UPLOADED",
      message: `${created.length} design image(s) uploaded`,
      userId: auth.user.id,
    },
  });
  return NextResponse.json({ designs: created });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_WRITE);
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await req.json();
  if (Array.isArray(body.order)) {
    await prisma.$transaction(
      (body.order as string[]).map((designId, i) =>
        prisma.leadDesign.update({ where: { id: designId }, data: { sortOrder: i } }),
      ),
    );
  }
  return NextResponse.json({ ok: true });
}
