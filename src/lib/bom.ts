export type BomItem = {
  id: string;
  category: string;
  description: string;
  make: string;
  unit: string;
  unit_price: number | null;
  gst_pct: number;
  default_qty: number;
  sort_order: number;
  active: boolean;
  notes: string | null;
};

export type ProposalLine = {
  bom_item_id?: string | null;
  category: string;
  description: string;
  make: string;
  unit: string;
  qty: number;
  unit_price: number;
  gst_pct: number;
};

export type ProposalSnapshot = {
  estimate_number?: string;
  notes?: string;
  lines: ProposalLine[];
};

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function defaultGstPct(category: string) {
  const c = category.toLowerCase();
  if (c.includes("module") || c.includes("inverter")) return 5;
  return 18;
}

export function lineAmounts(line: Pick<ProposalLine, "qty" | "unit_price" | "gst_pct">) {
  const taxable = roundMoney(Number(line.qty || 0) * Number(line.unit_price || 0));
  const gst = roundMoney(taxable * (Number(line.gst_pct || 0) / 100));
  return { taxable, gst, total: roundMoney(taxable + gst) };
}

export function proposalTotals(lines: ProposalLine[]) {
  return lines.reduce(
    (acc, line) => {
      const a = lineAmounts(line);
      acc.taxable += a.taxable;
      acc.gst += a.gst;
      acc.total += a.total;
      return acc;
    },
    { taxable: 0, gst: 0, total: 0 },
  );
}

export function parseProposalSnapshot(components: unknown): ProposalSnapshot {
  if (!components || typeof components !== "object") return { lines: [] };
  const raw = components as { lines?: unknown; notes?: unknown; estimate_number?: unknown };
  const lines = Array.isArray(raw.lines)
    ? raw.lines
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => ({
          bom_item_id: typeof row.bom_item_id === "string" ? row.bom_item_id : null,
          category: String(row.category || "Custom"),
          description: String(row.description || ""),
          make: String(row.make || ""),
          unit: String(row.unit || "Nos"),
          qty: Number(row.qty || 0),
          unit_price: Number(row.unit_price || 0),
          gst_pct: Number(row.gst_pct ?? defaultGstPct(String(row.category || ""))),
        }))
    : [];
  return {
    estimate_number: typeof raw.estimate_number === "string" ? raw.estimate_number : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    lines,
  };
}

export function formatEstimateNumber(serial: number, version: number) {
  return `EST-${String(serial).padStart(3, "0")}-V${version}`;
}

export function parseEstimateSerial(estimateNumber: string | null | undefined) {
  const match = estimateNumber?.match(/^EST-(\d+)-V(\d+)$/i);
  if (!match) return null;
  return { serial: Number(match[1]), version: Number(match[2]) };
}
