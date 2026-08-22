import { prisma } from "@/lib/db";

export default async function PlantsPage() {
  const plants = await prisma.solarPlant.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-2xl">Solar plants</h1>
      <p className="mt-2 text-sm text-muted">
        monitoring_provider, external_plant_id and last_sync_at are reserved for future inverter APIs.
      </p>
      <ul className="mt-6 space-y-3">
        {plants.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white p-4">
            <p className="font-semibold">{p.plantId}{p.isDemo ? " · demo" : ""}</p>
            <p className="text-sm">{p.customer.name} · {Number(p.capacityKwp)} kWp · {p.status}</p>
            <p className="text-xs text-muted">Provider {p.monitoringProvider || "manual"} · last sync {p.lastSyncAt?.toISOString() || "—"}</p>
          </li>
        ))}
        {plants.length === 0 && <p className="text-muted">No solar plants registered.</p>}
      </ul>
    </div>
  );
}
