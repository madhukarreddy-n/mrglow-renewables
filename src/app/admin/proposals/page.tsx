import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { formatInr } from "@/lib/utils";
import { STATUS_LABEL, type LeadStatus } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  try {
    await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const supabase = await createServerSupabase();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, estimate_number, price_inr, system_size_kwp, shared_at, created_at, leads(id, name, status, archived_at)")
    .order("created_at", { ascending: false });

  const rows = (proposals || []).filter((row) => {
    const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
    return !lead?.archived_at;
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Proposals</h1>
      <p className="mt-1 text-sm text-muted">Estimates stored against leads. Generate from a contacted lead.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="py-2">Estimate</th>
              <th>Lead</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Shared</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
              return (
                <tr key={row.id} className="border-t border-navy/10">
                  <td className="py-2">
                    <Link className="font-semibold" href={`/admin/proposals/${row.id}`}>
                      {row.estimate_number || row.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td>
                    {lead ? (
                      <Link href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{lead ? STATUS_LABEL[lead.status as LeadStatus] || lead.status : "—"}</td>
                  <td>{formatInr(Number(row.price_inr))}</td>
                  <td>{row.shared_at ? new Date(row.shared_at).toLocaleDateString("en-IN") : "Draft"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="mt-8 text-muted">No proposals yet.</p> : null}
    </div>
  );
}
