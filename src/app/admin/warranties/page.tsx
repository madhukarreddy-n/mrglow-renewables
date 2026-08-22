import { prisma } from "@/lib/db";

export default async function WarrantiesPage() {
  const rows = await prisma.warranty.findMany({
    include: { customer: true, plant: true },
    orderBy: { endDate: "asc" },
  });
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 3);
  return (
    <div>
      <h1 className="font-display text-2xl">Warranties</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((w) => (
          <li key={w.id} className={`rounded-2xl bg-white p-4 ${w.endDate < soon ? "ring-1 ring-gold" : ""}`}>
            <p className="font-semibold">{w.type} · {w.customer.name}</p>
            <p className="text-sm text-muted">{w.startDate.toLocaleDateString("en-IN")} → {w.endDate.toLocaleDateString("en-IN")}</p>
          </li>
        ))}
        {rows.length === 0 && <p className="text-muted">No warranties recorded yet.</p>}
      </ul>
    </div>
  );
}
