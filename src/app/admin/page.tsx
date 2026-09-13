import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from "@/lib/workflow";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  try {
    await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const supabase = await createServerSupabase();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, city, status, monthly_bill_inr, created_at")
    .is("archived_at", null);
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const lead of leads || []) {
    if (lead.status in counts) counts[lead.status as LeadStatus] += 1;
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Pipeline</h1>
      <p className="mt-2 text-sm text-muted">Leads grouped by workflow status.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LEAD_STATUSES.map((status) => (
          <Link key={status} href={`/admin/leads?status=${status}`} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{STATUS_LABEL[status]}</p>
            <p className="mt-2 font-display text-3xl">{counts[status]}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="py-2">Name</th>
              <th>City</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(leads || []).slice(0, 20).map((lead) => (
              <tr key={lead.id} className="border-t border-navy/10">
                <td className="py-2">
                  <Link className="font-semibold" href={`/admin/leads/${lead.id}`}>
                    {lead.name}
                  </Link>
                </td>
                <td>{lead.city || "—"}</td>
                <td>{STATUS_LABEL[lead.status as LeadStatus] || lead.status}</td>
                <td>{new Date(lead.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
