import { prisma } from "@/lib/db";
import { createPlant } from "../actions";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { plants: true, lead: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-2xl">Customers</h1>
      <ul className="mt-6 space-y-4">
        {customers.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-5">
            <p className="font-semibold">{c.customerNumber} · {c.name}{c.isDemo ? " · demo" : ""}</p>
            <p className="text-sm text-muted">{c.phone} · {c.category} · {c.status}</p>
            <p className="text-sm">{c.plants.length} plant(s)</p>
            <form action={createPlant} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="customerId" value={c.id} />
              <input name="capacityKwp" type="number" step="0.01" placeholder="kWp" className="max-w-32" required />
              <button className="btn-outline !py-2 text-xs">Add plant</button>
            </form>
            {c.leadId ? <Link className="text-xs underline" href={`/admin/leads/${c.leadId}`}>Open lead</Link> : null}
          </li>
        ))}
        {customers.length === 0 && <p className="text-muted">No customers yet. Convert a won lead.</p>}
      </ul>
    </div>
  );
}
