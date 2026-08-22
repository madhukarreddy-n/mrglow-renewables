import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export default async function AdminHome() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    newLeads,
    leadsToday,
    leadsMonth,
    qualified,
    pendingFollowups,
    overdueFollowups,
    surveys,
    openQuotes,
    won,
    customers,
    service,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW", isDemo: false } }),
    prisma.lead.count({ where: { createdAt: { gte: startToday }, isDemo: false } }),
    prisma.lead.count({ where: { createdAt: { gte: startMonth }, isDemo: false } }),
    prisma.lead.count({ where: { status: "QUALIFIED", isDemo: false } }),
    prisma.followUp.count({ where: { status: "OPEN" } }),
    prisma.followUp.count({ where: { status: "OPEN", dueAt: { lt: now } } }),
    prisma.siteSurvey.count({ where: { status: { in: ["PENDING", "SCHEDULED"] } } }),
    prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT", "VIEWED", "NEGOTIATION"] } } }),
    prisma.lead.count({ where: { status: "WON", isDemo: false } }),
    prisma.customer.count({ where: { isDemo: false } }),
    prisma.serviceRequest.count({ where: { status: { not: "COMPLETED" } } }),
  ]);

  const pipeline = await prisma.quotation.aggregate({
    _sum: { netCost: true },
    where: { status: { in: ["SENT", "VIEWED", "NEGOTIATION"] } },
  });
  const installed = await prisma.solarPlant.aggregate({
    _sum: { capacityKwp: true },
    where: { isDemo: false, status: { in: ["ACTIVE", "COMMISSIONED"] } },
  });

  const recent = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { assignedTo: true },
  });
  const followups = await prisma.followUp.findMany({
    where: { status: "OPEN" },
    orderBy: { dueAt: "asc" },
    take: 8,
    include: { lead: true },
  });
  const sources = await prisma.lead.groupBy({
    by: ["source"],
    _count: true,
    where: { isDemo: false },
  });

  const cards = [
    ["New Leads", newLeads],
    ["Leads Today", leadsToday],
    ["Leads This Month", leadsMonth],
    ["Qualified Leads", qualified],
    ["Pending Follow-ups", pendingFollowups],
    ["Overdue Follow-ups", overdueFollowups],
    ["Site Surveys", surveys],
    ["Open Quotations", openQuotes],
    ["Won Projects", won],
    ["Pipeline (₹)", Number(pipeline._sum.netCost || 0).toLocaleString("en-IN")],
    ["Installed kWp", Number(installed._sum.capacityKwp || 0)],
    ["Active Customers", customers],
    ["Service Requests", service],
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-muted">{l}</p>
            <p className="font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
      {overdueFollowups > 0 && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          {overdueFollowups} overdue follow-up{overdueFollowups > 1 ? "s" : ""}.{" "}
          <Link className="underline" href="/admin/followups">Review now</Link>
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-display text-xl">Recent leads</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {recent.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex justify-between">
                  <span>{l.leadNumber} · {l.name}{l.isDemo ? " (demo)" : ""}</span>
                  <span className="text-muted">{l.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-display text-xl">Follow-ups</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {followups.map((f) => (
              <li key={f.id} className="flex justify-between">
                <span>{f.lead.name}</span>
                <span className={f.dueAt < now ? "text-red-700" : "text-muted"}>
                  {f.dueAt.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
            {followups.length === 0 && <p className="text-muted">No follow-ups today.</p>}
          </ul>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5">
        <h2 className="font-display text-xl">Lead sources</h2>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {sources.map((s) => (
            <li key={s.source} className="rounded-full bg-mist px-3 py-1">
              {s.source}: {s._count}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted">Statuses: {(Object.keys(LeadStatus) as string[]).join(", ")}</p>
    </div>
  );
}
