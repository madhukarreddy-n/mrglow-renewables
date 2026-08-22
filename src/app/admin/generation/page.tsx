import { prisma } from "@/lib/db";
import { addGeneration } from "../actions";

export default async function GenerationPage() {
  const plants = await prisma.solarPlant.findMany({ include: { customer: true, generation: { take: 6, orderBy: { periodDate: "desc" } } } });
  return (
    <div>
      <h1 className="font-display text-2xl">Generation</h1>
      <p className="text-sm text-muted">Manual entry now. CSV/API providers can attach later without changing plant identity.</p>
      {plants.map((p) => (
        <section key={p.id} className="mt-6 rounded-2xl bg-white p-5">
          <h2 className="font-semibold">{p.plantId} · {p.customer.name}</h2>
          <form action={addGeneration} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="plantId" value={p.id} />
            <input type="date" name="periodDate" required />
            <input name="actualKwh" type="number" step="0.1" placeholder="Actual kWh" required />
            <input name="expectedKwh" type="number" step="0.1" placeholder="Expected kWh" />
            <button className="btn-outline !py-2 text-xs">Add month</button>
          </form>
          <ul className="mt-3 text-sm">
            {p.generation.map((g) => (
              <li key={g.id}>{g.periodDate.toLocaleDateString("en-IN")} · {Number(g.actualKwh)} kWh ({g.source})</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
