import { prisma } from "@/lib/db";
import { PipelineBoard } from "@/components/admin/pipeline-board";

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    select: { id: true, name: true, leadNumber: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl">Sales pipeline</h1>
      <p className="mb-4 text-sm text-muted">Drag a card to change status. Each change is audited.</p>
      <PipelineBoard leads={leads} />
    </div>
  );
}
