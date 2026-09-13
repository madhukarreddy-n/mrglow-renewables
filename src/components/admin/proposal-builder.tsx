"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultGstPct, lineAmounts, proposalTotals, type BomItem, type ProposalLine } from "@/lib/bom";
import { formatInr } from "@/lib/utils";
import { canCreateProposal, type LeadStatus } from "@/lib/workflow";

type Lead = {
  id: string;
  name: string;
  status: LeadStatus;
  estimated_system_kwp: number | null;
};

function groupKey(item: BomItem) {
  return `${item.category}||${item.description}`;
}

export function ProposalBuilder({ lead, items }: { lead: Lead; items: BomItem[] }) {
  const router = useRouter();
  const groups = useMemo(() => {
    const map = new Map<string, BomItem[]>();
    for (const item of items.filter((row) => row.active)) {
      const key = groupKey(item);
      map.set(key, [...(map.get(key) || []), item]);
    }
    return [...map.entries()].map(([key, options]) => ({ key, options, item: options[0] }));
  }, [items]);

  const [selected, setSelected] = useState<Record<string, { on: boolean; make: string; qty: string; price: string }>>(() => {
    const init: Record<string, { on: boolean; make: string; qty: string; price: string }> = {};
    for (const g of groups) {
      const first = g.options[0];
      const isModule = first.unit.toLowerCase() === "wp";
      const qty = isModule && lead.estimated_system_kwp ? String(Math.round(Number(lead.estimated_system_kwp) * 1000)) : String(first.default_qty ?? 1);
      init[g.key] = {
        on: !["Transportation", "I&C Cost", "Overheads"].includes(first.category) && first.unit_price != null,
        make: first.make,
        qty,
        price: first.unit_price != null ? String(first.unit_price) : "",
      };
    }
    return init;
  });
  const [custom, setCustom] = useState<ProposalLine[]>([]);
  const [notes, setNotes] = useState("");
  const [kwp, setKwp] = useState(lead.estimated_system_kwp?.toString() || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!canCreateProposal(lead.status)) {
    return (
      <p className="text-muted">
        Mark this lead as contacted before generating a proposal.
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-muted">
        Load the BOM catalogue first (Admin → BOM), then return here to build the estimate.
      </p>
    );
  }

  function lines(): ProposalLine[] {
    const fromBom: ProposalLine[] = [];
    for (const g of groups) {
      const state = selected[g.key];
      if (!state?.on) continue;
      const chosen = g.options.find((o) => o.make === state.make) || g.options[0];
      const price = Number(state.price);
      const qty = Number(state.qty);
      if (!qty || Number.isNaN(price)) continue;
      fromBom.push({
        bom_item_id: chosen.id,
        category: chosen.category,
        description: chosen.description,
        make: chosen.make,
        unit: chosen.unit,
        qty,
        unit_price: price,
        gst_pct: Number(chosen.gst_pct),
      });
    }
    return [...fromBom, ...custom.filter((row) => row.description && row.qty > 0)];
  }

  const snapshotLines = lines();
  const totals = proposalTotals(snapshotLines);

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        system_size_kwp: kwp ? Number(kwp) : null,
        notes,
        lines: snapshotLines,
        price_inr: totals.total,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save proposal");
      return;
    }
    router.push(`/admin/proposals/${data.proposal.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="text-xs uppercase text-muted">{lead.name}</p>
        <h1 className="font-display text-3xl">Generate proposal</h1>
        <label className="mt-4 block max-w-xs text-sm">
          System size (kWp)
          <input type="number" min={0} step={0.01} value={kwp} onChange={(e) => setKwp(e.target.value)} />
        </label>
      </div>

      {groups.map((g) => {
        const state = selected[g.key];
        if (!state) return null;
        const chosen = g.options.find((o) => o.make === state.make) || g.options[0];
        const preview = lineAmounts({
          qty: Number(state.qty) || 0,
          unit_price: Number(state.price) || 0,
          gst_pct: Number(chosen.gst_pct),
        });
        return (
          <div key={g.key} className="card p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={state.on}
                onChange={(e) => setSelected((cur) => ({ ...cur, [g.key]: { ...state, on: e.target.checked } }))}
              />
              <div>
                <p className="text-xs uppercase text-muted">{g.item.category}</p>
                <p className="font-semibold">{g.item.description}</p>
              </div>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <label className="text-sm">
                Make
                <select
                  value={state.make}
                  onChange={(e) => {
                    const make = e.target.value;
                    const next = g.options.find((o) => o.make === make);
                    setSelected((cur) => ({
                      ...cur,
                      [g.key]: {
                        ...state,
                        make,
                        price: next?.unit_price != null ? String(next.unit_price) : state.price,
                      },
                    }));
                  }}
                >
                  {g.options.map((o) => (
                    <option key={o.id} value={o.make}>
                      {o.make}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Qty ({g.item.unit})
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={state.qty}
                  onChange={(e) => setSelected((cur) => ({ ...cur, [g.key]: { ...state, qty: e.target.value } }))}
                />
              </label>
              <label className="text-sm">
                Unit price
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={state.price}
                  onChange={(e) => setSelected((cur) => ({ ...cur, [g.key]: { ...state, price: e.target.value } }))}
                />
              </label>
              <p className="self-end text-sm">
                GST {chosen.gst_pct}% · {formatInr(preview.total)}
              </p>
            </div>
          </div>
        );
      })}

      <div className="card p-5">
        <h2 className="font-display text-xl">Custom lines</h2>
        {custom.map((row, i) => (
          <div key={i} className="mt-3 grid gap-2 sm:grid-cols-6">
            <input placeholder="Description" value={row.description} onChange={(e) => setCustom((c) => c.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} />
            <input placeholder="Make" value={row.make} onChange={(e) => setCustom((c) => c.map((r, idx) => (idx === i ? { ...r, make: e.target.value } : r)))} />
            <input placeholder="Unit" value={row.unit} onChange={(e) => setCustom((c) => c.map((r, idx) => (idx === i ? { ...r, unit: e.target.value } : r)))} />
            <input type="number" placeholder="Qty" value={row.qty} onChange={(e) => setCustom((c) => c.map((r, idx) => (idx === i ? { ...r, qty: Number(e.target.value) } : r)))} />
            <input type="number" placeholder="Price" value={row.unit_price} onChange={(e) => setCustom((c) => c.map((r, idx) => (idx === i ? { ...r, unit_price: Number(e.target.value) } : r)))} />
            <button className="btn-outline !py-2 text-sm" onClick={() => setCustom((c) => c.filter((_, idx) => idx !== i))}>
              Remove
            </button>
          </div>
        ))}
        <button
          className="btn-outline mt-4"
          onClick={() =>
            setCustom((c) => [
              ...c,
              { category: "Custom", description: "", make: "Reputed Make", unit: "Nos", qty: 1, unit_price: 0, gst_pct: defaultGstPct("Custom") },
            ])
          }
        >
          Add custom line
        </button>
      </div>

      <div className="card p-6">
        <label className="block text-sm">
          Notes on estimate
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <p className="mt-4 text-sm">Taxable {formatInr(totals.taxable)} · GST {formatInr(totals.gst)}</p>
        <p className="font-display text-2xl">Total {formatInr(totals.total)}</p>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary mt-4" disabled={saving || snapshotLines.length === 0} onClick={save}>
          Save estimate PDF against lead
        </button>
      </div>
    </div>
  );
}
