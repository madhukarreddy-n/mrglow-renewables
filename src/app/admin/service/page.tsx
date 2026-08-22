import { prisma } from "@/lib/db";
import { createService } from "../actions";

export default async function ServicePage() {
  const tickets = await prisma.serviceRequest.findMany({ include: { customer: true, plant: true }, orderBy: { createdAt: "desc" } });
  const customers = await prisma.customer.findMany();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-2xl">Service</h1>
        <ul className="mt-4 space-y-3">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-2xl bg-white p-4 text-sm">
              <p className="font-semibold">{t.ticketNumber} · {t.status}</p>
              <p>{t.customer.name} · {t.type}</p>
              <p className="text-muted">{t.description}</p>
            </li>
          ))}
          {tickets.length === 0 && <p className="text-muted">No service requests.</p>}
        </ul>
      </div>
      <form action={createService} className="h-fit space-y-2 rounded-2xl bg-white p-5">
        <h2 className="font-display text-xl">New ticket</h2>
        <select name="customerId" required>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="type">
          <option>PANEL_CLEANING</option>
          <option>PREVENTIVE_MAINTENANCE</option>
          <option>INSPECTION</option>
          <option>INVERTER_SERVICE</option>
          <option>ELECTRICAL_SERVICE</option>
          <option>BREAKDOWN</option>
          <option>OTHER</option>
        </select>
        <textarea name="description" required placeholder="Description" />
        <button className="btn-primary w-full">Create</button>
      </form>
    </div>
  );
}
