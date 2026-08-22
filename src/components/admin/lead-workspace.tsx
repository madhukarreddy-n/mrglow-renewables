"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateProposalFromLead, saveLeadPricing, saveLeadSurvey } from "@/app/admin/actions";
import type { SurveyImport } from "@/lib/survey/excel";

export type LeadDesignDto = {
  id: string;
  fileKey: string;
  fileName: string;
  caption: string | null;
  sortOrder: number;
  includeInProposal: boolean;
};

export type LeadLineDto = {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
  includeInProposal: boolean;
};

export type LeadSurveyDto = {
  id: string;
  surveyNumber: string;
  address: string | null;
  propertyType: string | null;
  roofType: string | null;
  roofArea: string;
  availableArea: string;
  orientation: string | null;
  shading: string | null;
  electricityMeterDetails: string | null;
  phase: string | null;
  currentLoad: string | null;
  sanctionedLoad: string | null;
  recommendedCapacityKwp: string;
  notes: string | null;
  structureType: string | null;
  buildingFloors: string | null;
  roofHeight: string | null;
};

const TABS = ["Profile", "Site Survey", "Design", "Products & Pricing", "Proposal"] as const;

export function LeadWorkspace(props: {
  leadId: string;
  leadNumber: string;
  name: string;
  phone: string;
  email: string | null;
  state: string | null;
  pincode: string | null;
  category: string;
  message: string | null;
  source: string;
  score: number;
  designs: LeadDesignDto[];
  survey: LeadSurveyDto | null;
  lineItems: LeadLineDto[];
  lastQuotation: string | null;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Site Survey");
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 border-b border-navy/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t ? "bg-navy text-white" : "bg-sand text-navy"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Profile" && (
        <div className="mt-6 space-y-2 text-sm">
          <p><strong>Lead</strong> {props.leadNumber}</p>
          <p>{props.name} · {props.phone} · {props.email || "no email"}</p>
          <p>{props.category} · {props.state} {props.pincode}</p>
          <p>Source {props.source} · Score {props.score}</p>
          {props.message ? <p className="text-muted">{props.message}</p> : null}
          <p className="text-muted">
            This profile is the source for site survey, design, pricing and proposal. Do not re-enter customer details on the proposal.
          </p>
        </div>
      )}
      {tab === "Site Survey" && <SurveyTab leadId={props.leadId} survey={props.survey} />}
      {tab === "Design" && <DesignTab leadId={props.leadId} initial={props.designs} />}
      {tab === "Products & Pricing" && <PricingTab leadId={props.leadId} initial={props.lineItems} />}
      {tab === "Proposal" && (
        <ProposalTab
          leadId={props.leadId}
          survey={props.survey}
          designs={props.designs}
          lineItems={props.lineItems}
          lastQuotation={props.lastQuotation}
        />
      )}
    </div>
  );
}

function SurveyTab({ leadId, survey }: { leadId: string; survey: LeadSurveyDto | null }) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<Record<string, string>>({
    address: survey?.address || "",
    propertyType: survey?.propertyType || "",
    roofType: survey?.roofType || "",
    roofArea: survey?.roofArea || "",
    availableArea: survey?.availableArea || "",
    orientation: survey?.orientation || "",
    shading: survey?.shading || "",
    electricityMeterDetails: survey?.electricityMeterDetails || "",
    phase: survey?.phase || "",
    currentLoad: survey?.currentLoad || "",
    sanctionedLoad: survey?.sanctionedLoad || "",
    recommendedCapacityKwp: survey?.recommendedCapacityKwp || "",
    notes: survey?.notes || "",
    structureType: survey?.structureType || "",
    buildingFloors: survey?.buildingFloors || "",
    roofHeight: survey?.roofHeight || "",
  });
  const [importedRaw, setImportedRaw] = useState("");

  function set(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setNotice("");
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/surveys/import", { method: "POST", body: fd });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) {
      setNotice(data.error || "Could not read Excel file");
      return;
    }
    const mapped = data.mapped as SurveyImport;
    setImportedRaw(JSON.stringify(mapped));
    const next = { ...form };
    const pairs: [keyof SurveyImport, string][] = [
      ["address", "address"],
      ["propertyType", "propertyType"],
      ["roofType", "roofType"],
      ["roofArea", "roofArea"],
      ["availableArea", "availableArea"],
      ["orientation", "orientation"],
      ["shading", "shading"],
      ["electricityMeterDetails", "electricityMeterDetails"],
      ["phase", "phase"],
      ["currentLoad", "currentLoad"],
      ["sanctionedLoad", "sanctionedLoad"],
      ["recommendedCapacityKwp", "recommendedCapacityKwp"],
      ["notes", "notes"],
      ["structureType", "structureType"],
      ["buildingFloors", "buildingFloors"],
      ["roofHeight", "roofHeight"],
    ];
    for (const [src, dest] of pairs) {
      if (mapped[src]) next[dest] = mapped[src]!;
    }
    setForm(next);
    setNotice(
      "Imported from Excel. Review and edit the fields below, then save. Customer name/phone from Excel are informational only — the lead profile remains the customer record.",
    );
    e.target.value = "";
  }

  return (
    <form
      className="mt-6 space-y-3"
      action={async (fd) => {
        await saveLeadSurvey(fd);
        router.refresh();
      }}
    >
      <input type="hidden" name="leadId" value={leadId} />
      {survey ? <input type="hidden" name="surveyId" value={survey.id} /> : null}
      {importedRaw ? <input type="hidden" name="importedRaw" value={importedRaw} /> : null}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-sand p-4">
        <div>
          <p className="font-semibold">Excel upload</p>
          <p className="text-xs text-muted">
            Use the Mr.GLOW site-survey workbook (row headers or Field/Value sheet). Download the template if the Teams file is not at hand.
          </p>
        </div>
        <a className="btn-outline !py-2 text-xs" href="/api/admin/surveys/template">
          Download template
        </a>
        <label className="btn-primary !py-2 text-xs cursor-pointer">
          {importing ? "Reading…" : "Upload Excel"}
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onExcel} />
        </label>
      </div>
      {notice ? <p className="text-sm text-navy">{notice}</p> : null}
      {survey ? <p className="text-xs text-muted">Editing {survey.surveyNumber}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["address", "Site address"],
          ["propertyType", "Property type"],
          ["roofType", "Roof type"],
          ["roofArea", "Roof area"],
          ["availableArea", "Available / shadow-free area"],
          ["orientation", "Orientation"],
          ["shading", "Shading"],
          ["electricityMeterDetails", "Meter details"],
          ["phase", "Phase"],
          ["currentLoad", "Current load"],
          ["sanctionedLoad", "Sanctioned load"],
          ["recommendedCapacityKwp", "Recommended kWp"],
          ["structureType", "Structure type"],
          ["buildingFloors", "Floors"],
          ["roofHeight", "Roof height"],
        ].map(([name, label]) => (
          <label key={name} className="text-sm">
            {label}
            <input name={name} value={form[name]} onChange={(e) => set(name, e.target.value)} />
          </label>
        ))}
      </div>
      <label className="text-sm">
        Notes
        <textarea name="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
      <button className="btn-primary">Save site survey</button>
    </form>
  );
}

function DesignTab({ leadId, initial }: { leadId: string; initial: LeadDesignDto[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState(initial);
  useEffect(() => setList(initial), [initial]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    await fetch(`/api/admin/leads/${leadId}/designs`, { method: "POST", body: fd });
    setBusy(false);
    e.target.value = "";
    router.refresh();
  }

  async function patch(id: string, body: object) {
    await fetch(`/api/admin/leads/${leadId}/designs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/leads/${leadId}/designs/${id}`, { method: "DELETE" });
    setList((xs) => xs.filter((x) => x.id !== id));
    router.refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...list];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setList(next);
    await fetch(`/api/admin/leads/${leadId}/designs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((d) => d.id) }),
    });
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted">
        Upload solar design images. Tick “Include in Proposal” for layouts that should appear in the generated proposal PDF.
      </p>
      <label className="btn-primary inline-flex cursor-pointer !py-2 text-sm">
        {busy ? "Uploading…" : "Upload design images"}
        <input type="file" accept="image/*" multiple className="hidden" onChange={upload} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((d, i) => (
          <figure key={d.id} className="rounded-2xl border border-navy/10 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/files/${d.fileKey.split("/").map(encodeURIComponent).join("/")}`}
              alt={d.fileName}
              className="h-48 w-full rounded-xl object-contain bg-sand"
            />
            <figcaption className="mt-2 text-xs text-muted">{d.fileName}</figcaption>
            <input
              className="mt-2"
              defaultValue={d.caption || ""}
              placeholder="Caption"
              onBlur={(e) => patch(d.id, { caption: e.target.value })}
            />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                defaultChecked={d.includeInProposal}
                onChange={(e) => patch(d.id, { includeInProposal: e.target.checked })}
              />
              Include in Proposal
            </label>
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn-outline !py-1 text-xs" onClick={() => move(i, -1)}>Up</button>
              <button type="button" className="btn-outline !py-1 text-xs" onClick={() => move(i, 1)}>Down</button>
              <button type="button" className="btn-outline !py-1 text-xs" onClick={() => remove(d.id)}>Delete</button>
            </div>
          </figure>
        ))}
      </div>
      {list.length === 0 ? <p className="text-muted">No design images yet.</p> : null}
    </div>
  );
}

function PricingTab({ leadId, initial }: { leadId: string; initial: LeadLineDto[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(
    initial.length
      ? initial.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitPrice: Number(i.unitPrice),
          includeInProposal: i.includeInProposal,
        }))
      : [{ description: "", quantity: 1, unit: "nos", unitPrice: 0, includeInProposal: true }],
  );
  const total = useMemo(
    () => rows.reduce((s, r) => s + (r.quantity || 0) * (r.unitPrice || 0), 0),
    [rows],
  );

  return (
    <form
      className="mt-6 space-y-3"
      action={async (fd) => {
        fd.set("items", JSON.stringify(rows));
        await saveLeadPricing(fd);
        router.refresh();
      }}
    >
      <input type="hidden" name="leadId" value={leadId} />
      <p className="text-sm text-muted">
        Products and prices live on this lead. The proposal uses included lines — no second quotation form is required.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-6">
          <input
            className="md:col-span-2"
            placeholder="Description"
            value={r.description}
            onChange={(e) => setRows((xs) => xs.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
          />
          <input
            type="number"
            placeholder="Qty"
            value={r.quantity}
            onChange={(e) => setRows((xs) => xs.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))}
          />
          <input
            placeholder="Unit"
            value={r.unit}
            onChange={(e) => setRows((xs) => xs.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))}
          />
          <input
            type="number"
            placeholder="Unit price"
            value={r.unitPrice}
            onChange={(e) => setRows((xs) => xs.map((x, j) => (j === i ? { ...x, unitPrice: Number(e.target.value) } : x)))}
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={r.includeInProposal}
              onChange={(e) =>
                setRows((xs) => xs.map((x, j) => (j === i ? { ...x, includeInProposal: e.target.checked } : x)))
              }
            />
            In proposal
          </label>
        </div>
      ))}
      <button
        type="button"
        className="btn-outline !py-2 text-sm"
        onClick={() =>
          setRows((xs) => [...xs, { description: "", quantity: 1, unit: "nos", unitPrice: 0, includeInProposal: true }])
        }
      >
        Add line
      </button>
      <p className="font-semibold">Gross (included lines): ₹{total.toLocaleString("en-IN")}</p>
      <button className="btn-primary">Save products & pricing</button>
    </form>
  );
}

function ProposalTab(props: {
  leadId: string;
  survey: LeadSurveyDto | null;
  designs: LeadDesignDto[];
  lineItems: LeadLineDto[];
  lastQuotation: string | null;
}) {
  const router = useRouter();
  const includedDesigns = props.designs.filter((d) => d.includeInProposal);
  const includedItems = props.lineItems.filter((i) => i.includeInProposal);
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted">
        Proposal is assembled from this lead profile, the saved site survey, selected design images, and included product lines.
      </p>
      <ul className="text-sm">
        <li>Site survey: {props.survey ? props.survey.surveyNumber : "not saved yet"}</li>
        <li>Design images in proposal: {includedDesigns.length}</li>
        <li>Product lines in proposal: {includedItems.length}</li>
        {props.lastQuotation ? <li>Last quotation record: {props.lastQuotation}</li> : null}
      </ul>
      <form
        className="grid gap-3 md:grid-cols-2"
        action={async (fd) => {
          await generateProposalFromLead(fd);
          router.refresh();
          window.location.href = `/api/admin/leads/${props.leadId}/proposal`;
        }}
      >
        <input type="hidden" name="leadId" value={props.leadId} />
        <label className="text-sm">
          Estimated subsidy
          <input name="subsidy" type="number" defaultValue={0} />
        </label>
        <label className="text-sm">
          Discount
          <input name="discount" type="number" defaultValue={0} />
        </label>
        <label className="text-sm md:col-span-2">
          Warranty notes
          <input name="warranty" />
        </label>
        <label className="text-sm md:col-span-2">
          Terms
          <textarea name="terms" rows={2} />
        </label>
        <button className="btn-primary md:col-span-2">Save quotation record & download proposal PDF</button>
      </form>
      <a className="btn-outline inline-flex" href={`/api/admin/leads/${props.leadId}/proposal`}>
        Download current proposal PDF
      </a>
    </div>
  );
}
