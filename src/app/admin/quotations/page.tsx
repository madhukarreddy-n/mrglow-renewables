import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";

export default async function QuotationsPage() {
  const quotes = await prisma.quotation.findMany({
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-2xl">Quotations</h1>
      <p className="mt-2 text-sm text-muted">Create quotations from a lead. Versions are stored on each create/update.</p>
      <ul className="mt-6 space-y-3">
        {quotes.map((q) => (
          <li key={q.id} className="rounded-2xl bg-white p-4">
            <p className="font-semibold">{q.quotationNumber}{q.lead.isDemo ? " · demo" : ""}</p>
            <p className="text-sm text-muted">{q.lead.name} · {Number(q.systemCapacity)} kWp · {q.status}</p>
            <p className="text-sm">Net {formatInr(Number(q.netCost))} · Est. subsidy {formatInr(Number(q.subsidy))}</p>
          </li>
        ))}
        {quotes.length === 0 && <p className="text-muted">No quotations created.</p>}
      </ul>
    </div>
  );
}
