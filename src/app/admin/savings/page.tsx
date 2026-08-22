import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";

export default async function SavingsPage() {
  const rows = await prisma.plantSaving.findMany({
    include: { plant: { include: { customer: true } } },
    orderBy: { periodDate: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="font-display text-2xl">Customer savings</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-4 text-sm">
            <p className="font-semibold">{r.plant.plantId} · {r.plant.customer.name}</p>
            <p>{r.periodDate.toLocaleDateString("en-IN")} · actual {formatInr(Number(r.actualSavings))} · expected {r.expectedSavings ? formatInr(Number(r.expectedSavings)) : "—"}</p>
          </li>
        ))}
        {rows.length === 0 && <p className="text-muted">No savings records yet. Add generation to compute savings.</p>}
      </ul>
    </div>
  );
}
