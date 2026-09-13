"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { nextStatuses, canCreateProposal, STATUS_LABEL, type LeadStatus } from "@/lib/workflow";
import { formatInr } from "@/lib/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  site_type: string | null;
  monthly_bill_inr: number | null;
  estimated_system_kwp: number | null;
  estimated_annual_savings_inr: number | null;
  source: string;
  status: LeadStatus;
  assigned_employee_id: string | null;
  archived_at: string | null;
};

type HistoryRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_at: string;
};

type Proposal = {
  id: string;
  estimate_number: string | null;
  system_size_kwp: number | null;
  price_inr: number;
  share_token: string;
  shared_at: string | null;
};

export function LeadWorkspace({
  lead,
  history,
  proposals,
  employees,
  isAdmin,
}: {
  lead: Lead;
  history: HistoryRow[];
  proposals: Proposal[];
  employees: { id: string; name: string; email: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function setArchived(archived: boolean) {
    setError("");
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update archive");
      return;
    }
    router.refresh();
  }

  async function deleteLead() {
    if (
      !window.confirm(
        `Delete ${lead.name}? This removes the lead, proposals, photos and stored PDFs. This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not delete lead");
      return;
    }
    router.push("/admin/leads");
    router.refresh();
  }

  async function patchStatus(status: string) {
    setError("");
    const res = await fetch(`/api/leads/${lead.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update status");
      return;
    }
    router.refresh();
  }

  async function assign(assigned_employee_id: string) {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_employee_id: assigned_employee_id || null }),
    });
    if (!res.ok) setError("Could not reassign");
    else router.refresh();
  }

  async function share(id: string) {
    const res = await fetch(`/api/proposals/${id}/share`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not share");
      return;
    }
    if (data.url) await navigator.clipboard.writeText(data.url);
    router.refresh();
  }

  async function uploadPhoto(proposalId: string, file: File) {
    const sign = await fetch(`/api/proposals/${proposalId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "sign", filename: file.name }),
    });
    const signed = await sign.json();
    if (!sign.ok) {
      setError(signed.error || "Could not start upload");
      return;
    }
    const supabase = createBrowserSupabase();
    const { error: upErr } = await supabase.storage
      .from("proposal-photos")
      .uploadToSignedUrl(signed.path || signed.storage_path, signed.token, file);
    if (upErr) {
      setError(upErr.message || "Upload to storage failed");
      return;
    }
    const rec = await fetch(`/api/proposals/${proposalId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storage_path: signed.storage_path, caption: file.name }),
    });
    if (!rec.ok) {
      const data = await rec.json();
      setError(data.error || "Could not save photo");
      return;
    }
    router.refresh();
  }

  const next = nextStatuses(lead.status);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <p className="text-xs uppercase text-muted">
            {lead.archived_at ? "Archived · " : ""}
            {STATUS_LABEL[lead.status]}
          </p>
          <h1 className="font-display text-3xl">{lead.name}</h1>
          <p className="mt-2 text-sm">
            {lead.phone}
            {lead.email ? ` · ${lead.email}` : ""}
            {lead.city ? ` · ${lead.city}` : ""}
          </p>
          <p className="mt-2 text-sm text-muted">
            {lead.site_type || "site type not set"} · source {lead.source}
            {lead.monthly_bill_inr ? ` · bill ${formatInr(Number(lead.monthly_bill_inr))}` : ""}
          </p>
          {lead.estimated_system_kwp ? (
            <p className="mt-2 text-sm">Calculator estimate: {lead.estimated_system_kwp} kWp</p>
          ) : null}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl">Move workflow</h2>
          {lead.archived_at ? (
            <p className="mt-3 text-sm text-muted">Restore this lead to move workflow.</p>
          ) : (
            <>
              <textarea className="mt-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
              <div className="mt-3 flex flex-wrap gap-2">
                {next.map((s) => (
                  <button key={s} className="btn-primary !py-2 text-sm" onClick={() => patchStatus(s)}>
                    Mark {STATUS_LABEL[s]}
                  </button>
                ))}
                {next.length === 0 ? <p className="text-sm text-muted">No further transitions.</p> : null}
              </div>
            </>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl">Proposals</h2>
          {lead.archived_at ? (
            <p className="mt-3 text-sm text-muted">Restore this lead to generate or share a proposal.</p>
          ) : canCreateProposal(lead.status) ? (
            <Link className="btn-primary mt-4 inline-flex" href={`/admin/proposals/new?leadId=${lead.id}`}>
              Generate proposal
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted">Contact the customer, then generate a BOM-based estimate.</p>
          )}
        </div>

        {proposals.map((p) => (
          <div key={p.id} className="card p-6">
            <h3 className="font-display text-lg">{p.estimate_number || formatInr(Number(p.price_inr))}</h3>
            <p className="text-sm text-muted">
              {formatInr(Number(p.price_inr))}
              {p.system_size_kwp ? ` · ${p.system_size_kwp} kWp` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="btn-outline !py-2 text-sm" href={`/admin/proposals/${p.id}`}>
                Open
              </Link>
              <a className="btn-outline !py-2 text-sm" href={`/api/proposals/${p.id}/pdf?download=1`}>
                PDF
              </a>
              {p.shared_at ? (
                <p className="self-center text-sm">Shared {new Date(p.shared_at).toLocaleString("en-IN")}</p>
              ) : (
                <button className="btn-outline !py-2 text-sm" onClick={() => share(p.id)}>
                  Share with customer
                </button>
              )}
            </div>
            <label className="mt-4 block text-sm">
              Add product photo
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadPhoto(p.id, file);
                }}
              />
            </label>
          </div>
        ))}
      </div>

      <aside className="space-y-6">
        {isAdmin ? (
          <div className="card p-6">
            <h2 className="font-display text-lg">Assign</h2>
            <select
              className="mt-3"
              defaultValue={lead.assigned_employee_id || ""}
              onChange={(e) => assign(e.target.value)}
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="card p-6">
          <h2 className="font-display text-lg">Status history</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {history.map((h) => (
              <li key={h.id}>
                <p className="font-semibold">{h.to_status.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted">{new Date(h.changed_at).toLocaleString("en-IN")}</p>
                {h.note ? <p className="text-xs">{h.note}</p> : null}
              </li>
            ))}
          </ol>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="card p-6">
          <h2 className="font-display text-lg">Archive or delete</h2>
          <p className="mt-2 text-sm text-muted">
            Archive hides the lead from the pipeline. Delete removes the lead, proposals, product photos and PDFs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lead.archived_at ? (
              <button className="btn-outline !py-2 text-sm" onClick={() => setArchived(false)}>
                Restore
              </button>
            ) : (
              <button className="btn-outline !py-2 text-sm" onClick={() => setArchived(true)}>
                Archive
              </button>
            )}
            <button className="btn-outline !py-2 text-sm text-red-800" disabled={busy} onClick={deleteLead}>
              Delete permanently
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
