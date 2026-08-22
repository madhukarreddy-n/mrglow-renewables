import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { addFollowUp, assignLead, convertLead, updateLeadStatus } from "../../actions";
import { CalculatorResult } from "@/lib/calculator/engine";
import { formatInr } from "@/lib/utils";
import { LeadWorkspace } from "@/components/admin/lead-workspace";

function d(v: { toString(): string } | null | undefined) {
  return v == null ? "" : v.toString();
}

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      activities: { orderBy: { createdAt: "desc" } },
      followUps: { orderBy: { dueAt: "desc" } },
      surveys: { orderBy: { createdAt: "desc" } },
      quotations: { orderBy: { createdAt: "desc" } },
      calculatorReports: { orderBy: { createdAt: "desc" } },
      designs: { orderBy: { sortOrder: "asc" } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!lead) notFound();
  const users = await prisma.user.findMany({ where: { active: true } });
  const report = lead.calculatorReports[0];
  const result = report?.results as CalculatorResult | undefined;
  const survey = lead.surveys[0];

  async function statusAction(formData: FormData) {
    "use server";
    await updateLeadStatus(id, String(formData.get("status")) as LeadStatus);
  }
  async function assignAction(formData: FormData) {
    "use server";
    await assignLead(id, String(formData.get("assignedToId")));
  }
  async function convertAction() {
    "use server";
    await convertLead(id);
    const { redirect } = await import("next/navigation");
    redirect(`/admin/customers`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-white p-6">
          <p className="text-xs text-muted">{lead.leadNumber}{lead.isDemo ? " · demo" : ""}</p>
          <h1 className="font-display text-3xl">{lead.name}</h1>
          <p className="mt-2 text-sm">{lead.phone} · {lead.email || "no email"} · {lead.state} · {lead.category}</p>
          <p className="text-sm text-muted">Source {lead.source} · Score {lead.score}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={statusAction} className="flex gap-2">
              <select name="status" defaultValue={lead.status}>
                {Object.values(LeadStatus).map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="btn-outline !py-2">Update status</button>
            </form>
            <form action={assignAction} className="flex gap-2">
              <select name="assignedToId" defaultValue={lead.assignedToId || ""}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="btn-outline !py-2">Assign</button>
            </form>
            <form action={convertAction}>
              <button className="btn-primary !py-2">Convert to customer</button>
            </form>
          </div>
        </div>
        <LeadWorkspace
          leadId={lead.id}
          leadNumber={lead.leadNumber}
          name={lead.name}
          phone={lead.phone}
          email={lead.email}
          state={lead.state}
          pincode={lead.pincode}
          category={lead.category}
          message={lead.message}
          source={lead.source}
          score={lead.score}
          designs={lead.designs.map((x) => ({
            id: x.id,
            fileKey: x.fileKey,
            fileName: x.fileName,
            caption: x.caption,
            sortOrder: x.sortOrder,
            includeInProposal: x.includeInProposal,
          }))}
          survey={
            survey
              ? {
                  id: survey.id,
                  surveyNumber: survey.surveyNumber,
                  address: survey.address,
                  propertyType: survey.propertyType,
                  roofType: survey.roofType,
                  roofArea: d(survey.roofArea),
                  availableArea: d(survey.availableArea),
                  orientation: survey.orientation,
                  shading: survey.shading,
                  electricityMeterDetails: survey.electricityMeterDetails,
                  phase: survey.phase,
                  currentLoad: survey.currentLoad,
                  sanctionedLoad: survey.sanctionedLoad,
                  recommendedCapacityKwp: d(survey.recommendedCapacityKwp),
                  notes: survey.notes,
                  structureType: survey.structureType,
                  buildingFloors: survey.buildingFloors,
                  roofHeight: survey.roofHeight,
                }
              : null
          }
          lineItems={lead.lineItems.map((i) => ({
            id: i.id,
            description: i.description,
            quantity: d(i.quantity),
            unit: i.unit,
            unitPrice: d(i.unitPrice),
            amount: d(i.amount),
            includeInProposal: i.includeInProposal,
          }))}
          lastQuotation={lead.quotations[0]?.quotationNumber || null}
        />
        {result && (
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-display text-xl">Calculator result</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>kWp {result.recommendedKwp}</div>
              <div>Annual savings {formatInr(result.annualSavings)}</div>
              <div>Net investment {formatInr(result.netInvestment)}</div>
              <div>Estimated subsidy {formatInr(result.estimatedSubsidy)}</div>
              <div>Payback {result.paybackYears} yrs</div>
              <div>Report {report.reportNumber} v{report.calculationVersion}</div>
            </dl>
          </div>
        )}
        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-display text-xl">Activity</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {lead.activities.map((a) => (
              <li key={a.id}>
                <span className="text-muted">{a.createdAt.toLocaleString("en-IN")}</span> · {a.type}: {a.message}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="space-y-6">
        <form action={addFollowUp} className="rounded-2xl bg-white p-6 space-y-2">
          <h2 className="font-display text-xl">Add follow-up</h2>
          <input type="hidden" name="leadId" value={lead.id} />
          <select name="type">
            <option>CALL</option><option>WHATSAPP</option><option>EMAIL</option>
            <option>SITE_VISIT</option><option>MEETING</option><option>OTHER</option>
          </select>
          <input type="datetime-local" name="dueAt" required />
          <textarea name="notes" placeholder="Notes" />
          <button className="btn-primary w-full">Save follow-up</button>
        </form>
      </div>
    </div>
  );
}
