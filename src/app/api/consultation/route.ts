import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/rate-limit";
import { nextLeadNumber } from "@/lib/utils";
import { scoreConsultation } from "@/lib/leads/score";
import { CustomerCategory, LeadSource } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email().optional().or(z.literal("")),
  monthlyBillRange: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"]).optional(),
  preferredCallback: z.string().optional(),
  message: z.string().max(1000).optional(),
  agree: z.any(),
  company: z.string().optional(),
  calculatorReportId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const ok = await rateLimit(`lead:${ip}`, 8, 15 * 60 * 1000).catch(() => true);
  if (!ok) return NextResponse.json({ error: "Too many requests. Please try later." }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  if (parsed.data.company) {
    return NextResponse.json({ leadNumber: "MRG-OK" });
  }

  const recent = await prisma.lead.findFirst({
    where: {
      phone: parsed.data.phone,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) {
    return NextResponse.json({ leadNumber: recent.leadNumber, duplicate: true });
  }

  const count = await prisma.lead.count();
  const leadNumber = nextLeadNumber(count + 1);
  let reportId: string | undefined;
  if (parsed.data.calculatorReportId) {
    const report = await prisma.calculatorReport.findUnique({
      where: { shareToken: parsed.data.calculatorReportId },
    });
    reportId = report?.id;
  }

  const source = reportId ? LeadSource.SOLAR_CALCULATOR : LeadSource.DIRECT_CONSULTATION;
  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      pincode: parsed.data.pincode,
      state: parsed.data.state,
      category: (parsed.data.category as CustomerCategory) || "RESIDENTIAL",
      monthlyBillRange: parsed.data.monthlyBillRange,
      source,
      calculatorReportId: reportId,
      preferredCallback: parsed.data.preferredCallback,
      message: parsed.data.message,
      score: scoreConsultation(parsed.data.monthlyBillRange) + (reportId ? 20 : 0),
      activities: {
        create: [
          { type: "LEAD_CREATED", message: "Consultation submitted from website." },
          ...(reportId ? [{ type: "CALCULATOR_USED", message: "Calculator report attached." }] : []),
        ],
      },
    },
  });

  if (reportId) {
    await prisma.calculatorReport.update({
      where: { id: reportId },
      data: { leadId: lead.id },
    });
  }

  const settings = await getSettings();
  const html = `<p>New lead ${lead.leadNumber}</p>
<p>${lead.name} · ${lead.phone} · ${lead.email || ""}</p>
<p>State: ${lead.state || ""} · Category: ${lead.category} · Bill: ${lead.monthlyBillRange || ""}</p>
<p>Source: ${lead.source}</p>`;
  await sendEmail({
    to: process.env.LEAD_NOTIFY_EMAIL || settings.email,
    subject: `${settings.emailTemplates.leadNotifySubject} ${lead.leadNumber}`,
    html,
  });
  if (lead.email) {
    await sendEmail({
      to: lead.email,
      subject: settings.emailTemplates.leadConfirmSubject,
      html: `<p>Thank you ${lead.name}.</p><p>Your reference is <strong>${lead.leadNumber}</strong>. Our team will contact you.</p>`,
    });
  }

  return NextResponse.json({ leadNumber: lead.leadNumber });
}
