"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requirePermission, requireUser } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { audit } from "@/lib/audit";
import { saveSettings, CompanySettings } from "@/lib/settings";
import { nextLeadNumber } from "@/lib/utils";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const user = await requirePermission(PERMISSIONS.LEADS_WRITE);
  const old = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!old) throw new Error("Lead not found");
  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  await prisma.leadActivity.create({
    data: {
      leadId,
      type: "STATUS_CHANGED",
      message: `Status ${old.status} → ${status}`,
      userId: user.id,
    },
  });
  await audit({
    userId: user.id,
    action: "Lead status changed",
    entity: "Lead",
    entityId: leadId,
    oldValue: { status: old.status },
    newValue: { status },
  });
  revalidatePath("/admin");
}

export async function assignLead(leadId: string, assignedToId: string) {
  const user = await requirePermission(PERMISSIONS.LEADS_WRITE);
  await prisma.lead.update({ where: { id: leadId }, data: { assignedToId } });
  await prisma.leadActivity.create({
    data: { leadId, type: "LEAD_ASSIGNED", message: "Lead assigned", userId: user.id },
  });
  await audit({ userId: user.id, action: "Lead reassigned", entity: "Lead", entityId: leadId, newValue: { assignedToId } });
  revalidatePath("/admin/leads");
}

export async function addFollowUp(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.FOLLOWUPS);
  const leadId = String(formData.get("leadId"));
  await prisma.followUp.create({
    data: {
      leadId,
      assignedToId: user.id,
      type: String(formData.get("type")) as never,
      dueAt: new Date(String(formData.get("dueAt"))),
      notes: String(formData.get("notes") || ""),
    },
  });
  await prisma.leadActivity.create({
    data: { leadId, type: "FOLLOW_UP_ADDED", message: "Follow-up added", userId: user.id },
  });
  revalidatePath("/admin/followups");
}

export async function completeFollowUp(id: string) {
  await requirePermission(PERMISSIONS.FOLLOWUPS);
  await prisma.followUp.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date() } });
  revalidatePath("/admin/followups");
}

export async function createLead(formData: FormData) {
  await requirePermission(PERMISSIONS.LEADS_WRITE);
  const count = await prisma.lead.count();
  const lead = await prisma.lead.create({
    data: {
      leadNumber: nextLeadNumber(count + 1),
      name: String(formData.get("name")),
      phone: String(formData.get("phone")),
      email: String(formData.get("email") || "") || null,
      state: String(formData.get("state") || ""),
      category: String(formData.get("category") || "RESIDENTIAL") as never,
      source: "WEBSITE",
      activities: { create: { type: "LEAD_CREATED", message: "Created in CRM" } },
    },
  });
  revalidatePath("/admin/leads");
  return lead.id;
}

export async function convertLead(leadId: string) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_WRITE);
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  const count = await prisma.customer.count();
  const customer = await prisma.customer.create({
    data: {
      customerNumber: `CUST-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      state: lead.state,
      pincode: lead.pincode,
      category: lead.category,
    },
  });
  await prisma.lead.update({ where: { id: leadId }, data: { status: "WON" } });
  await prisma.leadActivity.create({
    data: { leadId, type: "LEAD_CONVERTED", message: `Customer ${customer.customerNumber}`, userId: user.id },
  });
  await audit({ userId: user.id, action: "Customer created", entity: "Customer", entityId: customer.id });
  revalidatePath("/admin/customers");
  return customer.id;
}

export async function createSurvey(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SURVEYS_WRITE);
  const count = await prisma.siteSurvey.count();
  await prisma.siteSurvey.create({
    data: {
      surveyNumber: `SUR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      leadId: String(formData.get("leadId")),
      surveyorId: user.id,
      address: String(formData.get("address") || ""),
      scheduledDate: formData.get("scheduledDate") ? new Date(String(formData.get("scheduledDate"))) : null,
      status: "SCHEDULED",
    },
  });
  const leadId = String(formData.get("leadId"));
  await prisma.lead.update({ where: { id: leadId }, data: { status: "SITE_SURVEY_SCHEDULED" } });
  await prisma.leadActivity.create({
    data: { leadId, type: "SITE_SURVEY_SCHEDULED", message: "Site survey scheduled", userId: user.id },
  });
  revalidatePath("/admin/site-surveys");
}

export async function createQuotation(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.QUOTATIONS_WRITE);
  const capacity = Number(formData.get("systemCapacity"));
  const gross = Number(formData.get("grossCost"));
  const subsidy = Number(formData.get("subsidy") || 0);
  const discount = Number(formData.get("discount") || 0);
  const net = gross - subsidy - discount;
  const count = await prisma.quotation.count();
  const q = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      leadId: String(formData.get("leadId")),
      ownerId: user.id,
      systemCapacity: capacity,
      grossCost: gross,
      subsidy,
      discount,
      netCost: net,
      warranty: String(formData.get("warranty") || ""),
      terms: String(formData.get("terms") || ""),
      items: {
        create: [
          {
            description: "Solar system (package)",
            quantity: 1,
            unit: "lot",
            unitPrice: gross,
            amount: gross,
          },
        ],
      },
      versions: { create: { version: 1, snapshot: { gross, subsidy, discount, net } } },
    },
  });
  await prisma.lead.update({
    where: { id: String(formData.get("leadId")) },
    data: { status: "PROPOSAL_SENT" },
  });
  await audit({ userId: user.id, action: "Quotation changed", entity: "Quotation", entityId: q.id, newValue: { net } });
  revalidatePath("/admin/quotations");
}

function numOrNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function saveLeadSurvey(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SURVEYS_WRITE);
  const leadId = String(formData.get("leadId"));
  const surveyId = String(formData.get("surveyId") || "");
  const data = {
    address: String(formData.get("address") || "") || null,
    propertyType: String(formData.get("propertyType") || "") || null,
    roofType: String(formData.get("roofType") || "") || null,
    roofArea: numOrNull(formData.get("roofArea")),
    availableArea: numOrNull(formData.get("availableArea")),
    orientation: String(formData.get("orientation") || "") || null,
    shading: String(formData.get("shading") || "") || null,
    electricityMeterDetails: String(formData.get("electricityMeterDetails") || "") || null,
    phase: String(formData.get("phase") || "") || null,
    currentLoad: String(formData.get("currentLoad") || "") || null,
    sanctionedLoad: String(formData.get("sanctionedLoad") || "") || null,
    recommendedCapacityKwp: numOrNull(formData.get("recommendedCapacityKwp")),
    notes: String(formData.get("notes") || "") || null,
    structureType: String(formData.get("structureType") || "") || null,
    buildingFloors: String(formData.get("buildingFloors") || "") || null,
    roofHeight: String(formData.get("roofHeight") || "") || null,
    importedRaw: formData.get("importedRaw")
      ? (JSON.parse(String(formData.get("importedRaw"))) as Prisma.InputJsonValue)
      : undefined,
    status: "COMPLETED" as const,
  };
  if (surveyId) {
    await prisma.siteSurvey.update({ where: { id: surveyId }, data });
  } else {
    const count = await prisma.siteSurvey.count();
    await prisma.siteSurvey.create({
      data: {
        surveyNumber: `SUR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
        leadId,
        surveyorId: user.id,
        ...data,
      },
    });
  }
  await prisma.lead.update({ where: { id: leadId }, data: { status: "QUALIFIED" } });
  await prisma.leadActivity.create({
    data: { leadId, type: "SITE_SURVEY_COMPLETED", message: "Site survey saved from lead profile", userId: user.id },
  });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function saveLeadPricing(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.QUOTATIONS_WRITE);
  const leadId = String(formData.get("leadId"));
  const items = JSON.parse(String(formData.get("items") || "[]")) as {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    includeInProposal: boolean;
  }[];
  await prisma.leadLineItem.deleteMany({ where: { leadId } });
  await prisma.leadLineItem.createMany({
    data: items
      .filter((i) => i.description?.trim())
      .map((i, idx) => ({
        leadId,
        description: i.description.trim(),
        quantity: i.quantity || 0,
        unit: i.unit || "nos",
        unitPrice: i.unitPrice || 0,
        amount: Number(((i.quantity || 0) * (i.unitPrice || 0)).toFixed(2)),
        includeInProposal: i.includeInProposal !== false,
        sortOrder: idx,
      })),
  });
  await prisma.leadActivity.create({
    data: { leadId, type: "PRICING_UPDATED", message: "Products and pricing updated on lead profile", userId: user.id },
  });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function generateProposalFromLead(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.QUOTATIONS_WRITE);
  const leadId = String(formData.get("leadId"));
  const subsidy = Number(formData.get("subsidy") || 0);
  const discount = Number(formData.get("discount") || 0);
  const warranty = String(formData.get("warranty") || "");
  const terms = String(formData.get("terms") || "");
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      surveys: { orderBy: { createdAt: "desc" }, take: 1 },
      lineItems: { where: { includeInProposal: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!lead) throw new Error("Lead not found");
  const gross = lead.lineItems.reduce((s, i) => s + Number(i.amount), 0);
  const net = gross - subsidy - discount;
  const capacity = lead.surveys[0]?.recommendedCapacityKwp
    ? Number(lead.surveys[0].recommendedCapacityKwp)
    : Number(formData.get("systemCapacity") || 0);
  const count = await prisma.quotation.count();
  const q = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      leadId,
      ownerId: user.id,
      systemCapacity: capacity || 0,
      grossCost: gross,
      subsidy,
      discount,
      netCost: net,
      warranty,
      terms,
      items: {
        create: lead.lineItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          amount: i.amount,
        })),
      },
      versions: {
        create: {
          version: 1,
          snapshot: {
            fromLead: true,
            surveyId: lead.surveys[0]?.id,
            designsIncluded: true,
            gross,
            subsidy,
            discount,
            net,
          },
        },
      },
    },
  });
  await prisma.lead.update({ where: { id: leadId }, data: { status: "PROPOSAL_SENT" } });
  await prisma.leadActivity.create({
    data: {
      leadId,
      type: "PROPOSAL_GENERATED",
      message: `Proposal ${q.quotationNumber} generated from lead profile`,
      userId: user.id,
    },
  });
  await audit({ userId: user.id, action: "Quotation changed", entity: "Quotation", entityId: q.id, newValue: { net } });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/quotations");
}

export async function createPlant(formData: FormData) {
  await requirePermission(PERMISSIONS.PLANTS);
  const count = await prisma.solarPlant.count();
  await prisma.solarPlant.create({
    data: {
      plantId: `PLANT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      customerId: String(formData.get("customerId")),
      capacityKwp: Number(formData.get("capacityKwp")),
      expectedMonthlyGeneration: Number(formData.get("expectedMonthly") || 0) || null,
      expectedAnnualGeneration: Number(formData.get("expectedAnnual") || 0) || null,
      status: "ACTIVE",
    },
  });
  revalidatePath("/admin/plants");
}

export async function addGeneration(formData: FormData) {
  await requirePermission(PERMISSIONS.PLANTS);
  const actual = Number(formData.get("actualKwh"));
  const expected = Number(formData.get("expectedKwh") || 0) || null;
  const plantId = String(formData.get("plantId"));
  const periodDate = new Date(String(formData.get("periodDate")));
  await prisma.plantGeneration.create({
    data: {
      plantId,
      periodDate,
      periodType: "MONTH",
      actualKwh: actual,
      expectedKwh: expected,
      source: "MANUAL",
    },
  });
  const plant = await prisma.solarPlant.findUnique({ where: { id: plantId } });
  const tariff = 8;
  await prisma.plantSaving.create({
    data: {
      plantId,
      periodDate,
      periodType: "MONTH",
      actualSavings: actual * tariff,
      expectedSavings: expected ? Number(expected) * tariff : null,
      tariffUsed: tariff,
    },
  });
  revalidatePath("/admin/generation");
}

export async function createService(formData: FormData) {
  await requirePermission(PERMISSIONS.SERVICE);
  const count = await prisma.serviceRequest.count();
  await prisma.serviceRequest.create({
    data: {
      ticketNumber: `SRV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      customerId: String(formData.get("customerId")),
      plantId: String(formData.get("plantId") || "") || null,
      type: String(formData.get("type")) as never,
      description: String(formData.get("description")),
      priority: String(formData.get("priority") || "NORMAL"),
    },
  });
  revalidatePath("/admin/service");
}

export async function createAmc(formData: FormData) {
  await requirePermission(PERMISSIONS.AMC);
  await prisma.amcContract.create({
    data: {
      customerId: String(formData.get("customerId")),
      plantId: String(formData.get("plantId") || "") || null,
      planName: String(formData.get("planName")),
      startDate: new Date(String(formData.get("startDate"))),
      endDate: new Date(String(formData.get("endDate"))),
      frequency: String(formData.get("frequency")),
      status: "ACTIVE",
    },
  });
  revalidatePath("/admin/amc");
}

export async function saveCompanySettings(formData: FormData) {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const current = JSON.parse(String(formData.get("json"))) as CompanySettings;
  await saveSettings(current);
  await audit({
    action: "Calculator configuration changed",
    entity: "Setting",
    entityId: "company",
    newValue: current as unknown as Prisma.InputJsonValue,
  });
  revalidatePath("/admin/settings");
}

export async function saveFaq(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT);
  const id = String(formData.get("id") || "");
  const data = {
    question: String(formData.get("question")),
    answer: String(formData.get("answer")),
    published: formData.get("published") === "on",
  };
  if (id) await prisma.faq.update({ where: { id }, data });
  else await prisma.faq.create({ data });
  revalidatePath("/admin/faqs");
}

export async function saveTestimonial(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT);
  await prisma.testimonial.create({
    data: {
      customerName: String(formData.get("customerName")),
      company: String(formData.get("company") || ""),
      location: String(formData.get("location") || ""),
      category: String(formData.get("category") || ""),
      systemCapacity: String(formData.get("systemCapacity") || ""),
      quote: String(formData.get("quote")),
      approved: formData.get("approved") === "on",
    },
  });
  revalidatePath("/admin/testimonials");
}

export async function saveProject(formData: FormData) {
  await requirePermission(PERMISSIONS.CONTENT);
  await prisma.project.create({
    data: {
      name: String(formData.get("name")),
      location: String(formData.get("location") || ""),
      category: String(formData.get("category")),
      capacityKwp: Number(formData.get("capacityKwp") || 0) || null,
      description: String(formData.get("description") || ""),
      published: formData.get("published") === "on",
      isDemo: false,
    },
  });
  revalidatePath("/admin/projects");
}

export async function updateCalculatorConfig(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const id = String(formData.get("id"));
  await prisma.calculatorConfig.update({
    where: { id },
    data: {
      peakSunHours: Number(formData.get("peakSunHours")),
      systemCostPerKwp: Number(formData.get("systemCostPerKwp")),
      systemEfficiency: Number(formData.get("systemEfficiency")),
      panelWattage: Number(formData.get("panelWattage")),
      active: formData.get("active") === "on",
    },
  });
  await audit({
    userId: user.id,
    action: "Calculator configuration changed",
    entity: "CalculatorConfig",
    entityId: id,
  });
  revalidatePath("/admin/settings");
}

export async function requireUserAction() {
  return requireUser();
}
