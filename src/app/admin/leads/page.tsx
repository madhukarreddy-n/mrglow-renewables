import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const leads = await prisma.lead.findMany({
    where: {
      ...(sp.status ? { status: sp.status as LeadStatus } : {}),
      ...(sp.q
        ? {
            OR: [
              { leadNumber: { contains: sp.q, mode: "insensitive" } },
              { name: { contains: sp.q, mode: "insensitive" } },
              { phone: { contains: sp.q } },
              { email: { contains: sp.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { assignedTo: true, calculatorReports: { take: 1, orderBy: { createdAt: "desc" } } },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Leads</h1>
        <Link href="/admin/leads/new" className="btn-primary !py-2 text-sm">New lead</Link>
      </div>
      <form className="mt-4 flex gap-2">
        <input name="q" placeholder="Search number, name, phone, email" defaultValue={sp.q} />
        <select name="status" defaultValue={sp.status || ""}>
          <option value="">All statuses</option>
          {Object.values(LeadStatus).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn-outline">Filter</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-xs text-muted">
            <tr>
              {["Lead", "Customer", "Phone", "Category", "Source", "Status", "Assigned", "Created"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Link className="font-semibold" href={`/admin/leads/${l.id}`}>{l.leadNumber}</Link>
                  {l.isDemo ? <span className="ml-2 text-xs text-gold">demo</span> : null}
                </td>
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">{l.phone}</td>
                <td className="px-3 py-2">{l.category}</td>
                <td className="px-3 py-2">{l.source}</td>
                <td className="px-3 py-2">{l.status}</td>
                <td className="px-3 py-2">{l.assignedTo?.name || "—"}</td>
                <td className="px-3 py-2">{l.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <p className="p-8 text-muted">No leads yet.</p>}
      </div>
    </div>
  );
}
