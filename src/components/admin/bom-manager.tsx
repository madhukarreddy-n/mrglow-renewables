"use client";

import { useMemo, useState } from "react";
import type { BomItem } from "@/lib/bom";
import { defaultGstPct } from "@/lib/bom";
import { formatInr } from "@/lib/utils";

function money(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return formatInr(n);
}

export function BomManager({ items, isAdmin }: { items: BomItem[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [seeding, setSeeding] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, BomItem[]>();
    for (const item of rows) {
      if (filter && !`${item.category} ${item.description} ${item.make}`.toLowerCase().includes(filter.toLowerCase())) {
        continue;
      }
      const key = item.category;
      map.set(key, [...(map.get(key) || []), item]);
    }
    return [...map.entries()];
  }, [rows, filter]);

  async function save(id: string, patch: Partial<BomItem>) {
    setError("");
    const res = await fetch(`/api/bom/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setRows((cur) => cur.map((row) => (row.id === id ? data.item : row)));
  }

  async function addItem() {
    setError("");
    const res = await fetch("/api/bom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "Custom",
        description: "New item",
        make: "Reputed Make",
        unit: "Nos",
        unit_price: 0,
        gst_pct: defaultGstPct("Custom"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add");
      return;
    }
    setRows((cur) => [...cur, data.item]);
  }

  async function seed() {
    setSeeding(true);
    setError("");
    const res = await fetch("/api/bom/seed", { method: "POST" });
    const data = await res.json();
    setSeeding(false);
    if (!res.ok) {
      setError(data.error || "Could not seed");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm">
          Search
          <input className="mt-1" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Brand, item, category" />
        </label>
        {isAdmin ? (
          <div className="flex gap-2">
            {rows.length === 0 ? (
              <button className="btn-outline" disabled={seeding} onClick={seed}>
                Load 3kW BOM catalogue
              </button>
            ) : null}
            <button className="btn-primary" onClick={addItem}>
              Add item
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">Only admins can change catalogue prices.</p>
        )}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {grouped.map(([category, list]) => (
        <section key={category} className="card overflow-x-auto p-4">
          <h2 className="font-display text-xl">{category}</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-2">Item</th>
                <th>Make</th>
                <th>Unit</th>
                <th>Price</th>
                <th>GST %</th>
                <th>Default qty</th>
                {isAdmin ? <th>Active</th> : null}
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-t border-navy/10">
                  <td className="max-w-xs py-2">{item.description}</td>
                  <td>{item.make}</td>
                  <td>{item.unit}</td>
                  <td>
                    {isAdmin ? (
                      <input
                        className="w-28"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={item.unit_price ?? ""}
                        onBlur={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          if (value !== item.unit_price) void save(item.id, { unit_price: value });
                        }}
                      />
                    ) : (
                      money(item.unit_price)
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        className="w-20"
                        type="number"
                        min={0}
                        step="0.5"
                        defaultValue={item.gst_pct}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value !== Number(item.gst_pct)) void save(item.id, { gst_pct: value });
                        }}
                      />
                    ) : (
                      item.gst_pct
                    )}
                  </td>
                  <td>{item.default_qty}</td>
                  {isAdmin ? (
                    <td>
                      <input
                        type="checkbox"
                        defaultChecked={item.active}
                        onChange={(e) => void save(item.id, { active: e.target.checked })}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {rows.length === 0 ? (
        <p className="text-muted">No catalogue yet. Admin can load the 3 kW Bill of Materials seed.</p>
      ) : null}
    </div>
  );
}
