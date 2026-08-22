import { prisma } from "@/lib/db";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-display text-2xl">Audit log</h1>
      <ul className="mt-6 space-y-2 text-sm">
        {logs.map((l) => (
          <li key={l.id} className="rounded-xl bg-white p-3">
            {l.createdAt.toLocaleString("en-IN")} · {l.user?.email || "system"} · {l.action} · {l.entity} {l.entityId}
          </li>
        ))}
        {logs.length === 0 && <p className="text-muted">No audit events yet.</p>}
      </ul>
    </div>
  );
}
