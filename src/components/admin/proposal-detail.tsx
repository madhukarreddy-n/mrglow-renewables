"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { parseProposalSnapshot } from "@/lib/bom";
import { formatInr } from "@/lib/utils";

type Proposal = {
  id: string;
  estimate_number: string | null;
  system_size_kwp: number | null;
  price_inr: number;
  components: unknown;
  share_token: string;
  shared_at: string | null;
  pdf_storage_path: string | null;
};

type Photo = { id: string; caption: string | null; uploaded_at: string };

export function ProposalDetail({
  proposal,
  photos,
  leadName,
}: {
  proposal: Proposal;
  photos: Photo[];
  leadName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const snapshot = parseProposalSnapshot(proposal.components);

  async function share() {
    const res = await fetch(`/api/proposals/${proposal.id}/share`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not share");
      return;
    }
    if (data.url) await navigator.clipboard.writeText(data.url);
    router.refresh();
  }

  async function uploadPhoto(file: File) {
    const sign = await fetch(`/api/proposals/${proposal.id}/photos`, {
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
    const rec = await fetch(`/api/proposals/${proposal.id}/photos`, {
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

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="text-xs uppercase text-muted">{leadName}</p>
        <h1 className="font-display text-3xl">{proposal.estimate_number || "Proposal"}</h1>
        <p className="mt-2 text-sm text-muted">
          {proposal.system_size_kwp ? `${proposal.system_size_kwp} kWp · ` : ""}
          {formatInr(Number(proposal.price_inr))}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="btn-primary" href={`/api/proposals/${proposal.id}/pdf?download=1`}>
            Download PDF
          </a>
          {proposal.shared_at ? (
            <a className="btn-outline" href={`/p/${proposal.share_token}`} target="_blank" rel="noreferrer">
              Customer link
            </a>
          ) : (
            <button className="btn-outline" onClick={share}>
              Share with customer
            </button>
          )}
        </div>
        {proposal.shared_at ? (
          <p className="mt-3 text-sm">Shared {new Date(proposal.shared_at).toLocaleString("en-IN")}. Price is locked; photos can still be added.</p>
        ) : null}
      </div>

      <div className="card overflow-x-auto p-6">
        <h2 className="font-display text-xl">Bill of materials</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="py-2">Item</th>
              <th>Make</th>
              <th>Qty</th>
              <th>GST</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.lines.map((line, i) => (
              <tr key={i} className="border-t border-navy/10">
                <td className="py-2">
                  {line.category}: {line.description}
                </td>
                <td>{line.make}</td>
                <td>
                  {line.qty} {line.unit}
                </td>
                <td>{line.gst_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl">Product photos</h2>
        <p className="mt-1 text-sm text-muted">You can add photos after the estimate is shared.</p>
        <label className="mt-4 block text-sm">
          Upload
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />
        </label>
        <ul className="mt-4 space-y-1 text-sm">
          {photos.map((photo) => (
            <li key={photo.id}>{photo.caption || photo.id}</li>
          ))}
        </ul>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
