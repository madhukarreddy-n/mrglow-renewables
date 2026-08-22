import { prisma } from "@/lib/db";

export default async function ProjectsAdmin() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-2xl">Projects</h1>
      <p className="text-sm text-muted">Add via Settings. Demo projects must not be published.</p>
      <ul className="mt-6 space-y-3">
        {projects.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white p-4">
            {p.name} · {p.category} · {p.published ? "published" : "draft"} {p.isDemo ? "· demo" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
