import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; archived?: string }>;
}) {
  try {
    await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const { status, archived: archivedParam } = await searchParams;
  const archived = archivedParam === "1";
  const supabase = await createServerSupabase();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  q = archived ? q.not("archived_at", "is", null) : q.is("archived_at", null);
  if (status) q = q.eq("status", status);
  const { data: leads } = await q;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{archived ? "Archived leads" : "Leads"}</h1>
          <p className="mt-1 text-sm text-muted">
            {archived ? "Hidden from the pipeline. Restore from the lead page." : "Filter by workflow stage."}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/leads" className={`rounded-full px-3 py-1 text-xs ${!status && !archived ? "bg-navy text-white" : "bg-white"}`}>
          All
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs ${status === s && !archived ? "bg-navy text-white" : "bg-white"}`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
        <Link
          href="/admin/leads?archived=1"
          className={`rounded-full px-3 py-1 text-xs ${archived ? "bg-navy text-white" : "bg-white"}`}
        >
          Archived
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(leads || []).map((lead) => (
          <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="card p-5">
            <p className="text-xs uppercase text-muted">{STATUS_LABEL[lead.status as LeadStatus] || lead.status}</p>
            <h2 className="mt-2 font-display text-xl">{lead.name}</h2>
            <p className="text-sm text-muted">
              {lead.phone}
              {lead.city ? ` · ${lead.city}` : ""}
            </p>
            <p className="mt-2 text-xs text-muted">{lead.source}</p>
          </Link>
        ))}
      </div>
      {(leads || []).length === 0 ? <p className="mt-8 text-muted">No leads in this view.</p> : null}
    </div>
  );
}
