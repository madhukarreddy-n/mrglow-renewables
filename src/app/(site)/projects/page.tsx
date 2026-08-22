import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Projects" };

export default async function Page() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  try {
    projects = await prisma.project.findMany({
      where: { published: true, isDemo: false },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    projects = [];
  }
  return (
    <section className="section">
      <div className="container-wide">
        <h1 className="font-display text-4xl">Projects</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Only verified, published projects appear here. Demo records stay inside Admin.
        </p>
        {projects.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed p-10 text-muted">
            No published projects yet. Add and publish case studies from Admin when site photographs and details are available.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <article key={p.id} className="card p-6">
                <p className="text-xs uppercase text-muted">{p.category}</p>
                <h2 className="mt-2 font-display text-2xl">{p.name}</h2>
                <p className="text-sm text-muted">{p.location}</p>
                {p.capacityKwp ? <p className="mt-2 text-sm">{Number(p.capacityKwp)} kWp</p> : null}
                {p.description ? <p className="mt-3 text-sm">{p.description}</p> : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
