import { prisma } from "@/lib/db";

export default async function ReportsPage() {
  const bySource = await prisma.lead.groupBy({ by: ["source"], _count: true, where: { isDemo: false } });
  const byCategory = await prisma.lead.groupBy({ by: ["category"], _count: true, where: { isDemo: false } });
  const byState = await prisma.lead.groupBy({ by: ["state"], _count: true, where: { isDemo: false } });
  const calcs = await prisma.calculatorReport.count();
  const leadsFromCalc = await prisma.lead.count({ where: { source: "SOLAR_CALCULATOR", isDemo: false } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Reports</h1>
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Calculator usage</h2>
        <p className="text-sm">{calcs} reports · {leadsFromCalc} calculator leads (non-demo)</p>
      </section>
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Leads by source</h2>
        <ul className="text-sm">{bySource.map((s) => <li key={s.source}>{s.source}: {s._count}</li>)}</ul>
      </section>
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Leads by category</h2>
        <ul className="text-sm">{byCategory.map((s) => <li key={s.category}>{s.category}: {s._count}</li>)}</ul>
      </section>
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-semibold">Leads by state</h2>
        <ul className="text-sm">{byState.map((s) => <li key={String(s.state)}>{s.state || "—"}: {s._count}</li>)}</ul>
      </section>
    </div>
  );
}
