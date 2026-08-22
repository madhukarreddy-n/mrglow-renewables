import { prisma } from "@/lib/db";
import { createAmc } from "../actions";

export default async function AmcPage() {
  const contracts = await prisma.amcContract.findMany({ include: { customer: true, plant: true } });
  const customers = await prisma.customer.findMany();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-2xl">AMC</h1>
        <ul className="mt-4 space-y-3">
          {contracts.map((c) => (
            <li key={c.id} className="rounded-2xl bg-white p-4 text-sm">
              <p className="font-semibold">{c.planName} · {c.status}</p>
              <p>{c.customer.name} · {c.startDate.toLocaleDateString("en-IN")} → {c.endDate.toLocaleDateString("en-IN")}</p>
            </li>
          ))}
          {contracts.length === 0 && <p className="text-muted">No AMC contracts.</p>}
        </ul>
      </div>
      <form action={createAmc} className="space-y-2 rounded-2xl bg-white p-5">
        <h2 className="font-display text-xl">New AMC</h2>
        <select name="customerId">{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input name="planName" required placeholder="Plan name" />
        <input type="date" name="startDate" required />
        <input type="date" name="endDate" required />
        <select name="frequency">
          <option>MONTHLY</option>
          <option>QUARTERLY</option>
          <option>YEARLY</option>
        </select>
        <button className="btn-primary w-full">Create</button>
      </form>
    </div>
  );
}
