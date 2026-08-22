import { prisma } from "@/lib/db";
import { completeFollowUp } from "../actions";

export default async function FollowupsPage() {
  const now = new Date();
  const open = await prisma.followUp.findMany({
    where: { status: "OPEN" },
    include: { lead: true, assignedTo: true },
    orderBy: { dueAt: "asc" },
  });
  const overdue = open.filter((f) => f.dueAt < now);
  const today = open.filter((f) => f.dueAt >= now && f.dueAt.toDateString() === now.toDateString());
  const upcoming = open.filter((f) => f.dueAt > now && f.dueAt.toDateString() !== now.toDateString());

  function List({ title, items }: { title: string; items: typeof open }) {
    return (
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-display text-xl">{title}</h2>
        {items.length === 0 ? <p className="mt-3 text-sm text-muted">No follow-ups.</p> : (
          <ul className="mt-3 space-y-3">
            {items.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">{f.lead.name} · {f.type}</p>
                  <p className="text-muted">{f.dueAt.toLocaleString("en-IN")} · {f.notes}</p>
                </div>
                <form action={async () => { "use server"; await completeFollowUp(f.id); }}>
                  <button className="btn-outline !py-1 text-xs">Complete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Follow-ups</h1>
      <List title="Overdue" items={overdue} />
      <List title="Today" items={today} />
      <List title="Upcoming" items={upcoming} />
    </div>
  );
}
