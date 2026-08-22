import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function SurveysPage() {
  const surveys = await prisma.siteSurvey.findMany({
    include: { lead: true, surveyor: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-2xl">Site surveys</h1>
      <p className="mt-2 text-sm text-muted">
        Open a lead to upload Excel, complete the survey form, and push the same data into the proposal.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b text-xs text-muted">
            <tr>
              <th className="p-3 text-left">Survey</th>
              <th className="p-3 text-left">Lead</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-3">{s.surveyNumber}</td>
                <td className="p-3">
                  <Link className="underline" href={`/admin/leads/${s.leadId}`}>
                    {s.lead.name}
                  </Link>
                </td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">{s.scheduledDate?.toLocaleDateString("en-IN") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {surveys.length === 0 && <p className="p-8 text-muted">No site surveys scheduled.</p>}
      </div>
    </div>
  );
}
