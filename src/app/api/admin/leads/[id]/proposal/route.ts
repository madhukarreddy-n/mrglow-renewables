import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireApiPermission } from "@/lib/auth/api";
import { getSettings } from "@/lib/settings";
import { getObjectBuffer } from "@/lib/storage";
import { ProposalPdf } from "@/lib/pdf/proposal";

function dataUri(key: string, buf: Buffer) {
  const ext = key.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(PERMISSIONS.QUOTATIONS_READ);
  if (auth.response) return auth.response;
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      surveys: { orderBy: { createdAt: "desc" }, take: 1 },
      lineItems: { where: { includeInProposal: true }, orderBy: { sortOrder: "asc" } },
      designs: { where: { includeInProposal: true }, orderBy: { sortOrder: "asc" } },
      quotations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const settings = await getSettings();
  const survey = lead.surveys[0];
  const q = lead.quotations[0];
  const included = lead.lineItems;
  const gross = included.reduce((s, i) => s + Number(i.amount), 0);
  const subsidy = q ? Number(q.subsidy) : 0;
  const discount = q ? Number(q.discount) : 0;
  const capacity = q
    ? String(q.systemCapacity)
    : survey?.recommendedCapacityKwp
      ? String(survey.recommendedCapacityKwp)
      : "—";

  const images = [];
  for (const d of lead.designs) {
    const buf = await getObjectBuffer(d.fileKey);
    if (buf) images.push({ src: dataUri(d.fileKey, buf), caption: d.caption });
  }

  const pdf = await renderToBuffer(
    React.createElement(ProposalPdf, {
      brand: settings.brandName,
      quotationNumber: q?.quotationNumber || `${lead.leadNumber}-PROPOSAL`,
      date: new Date().toLocaleDateString("en-IN"),
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      lead: {
        leadNumber: lead.leadNumber,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        state: lead.state,
        pincode: lead.pincode,
        category: lead.category,
        message: lead.message,
      },
      survey: survey
        ? {
            surveyNumber: survey.surveyNumber,
            address: survey.address,
            propertyType: survey.propertyType,
            roofType: survey.roofType,
            roofArea: survey.roofArea != null ? String(survey.roofArea) : null,
            availableArea: survey.availableArea != null ? String(survey.availableArea) : null,
            orientation: survey.orientation,
            shading: survey.shading,
            phase: survey.phase,
            currentLoad: survey.currentLoad,
            sanctionedLoad: survey.sanctionedLoad,
            recommendedCapacityKwp:
              survey.recommendedCapacityKwp != null ? String(survey.recommendedCapacityKwp) : null,
            structureType: survey.structureType,
            notes: survey.notes,
          }
        : null,
      items: included.map((i) => ({
        description: i.description,
        quantity: String(i.quantity),
        unit: i.unit,
        unitPrice: String(i.unitPrice),
        amount: String(i.amount),
      })),
      totals: {
        gross: String(q ? q.grossCost : gross),
        subsidy: String(subsidy),
        discount: String(discount),
        net: String(q ? q.netCost : gross - subsidy - discount),
        capacity,
      },
      images,
      warranty: q?.warranty,
      terms: q?.terms,
    }) as never,
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${lead.leadNumber}-proposal.pdf"`,
    },
  });
}
