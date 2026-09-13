import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { ProposalBuilder } from "@/components/admin/proposal-builder";
import type { BomItem } from "@/lib/bom";
import { canCreateProposal, isLeadStatus } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  try {
    await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const { leadId } = await searchParams;
  if (!leadId) redirect("/admin/leads");
  const supabase = await createServerSupabase();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) redirect("/admin/leads");
  if (lead.archived_at || !isLeadStatus(lead.status) || !canCreateProposal(lead.status)) {
    redirect(`/admin/leads/${lead.id}`);
  }
  const { data: items } = await supabase.from("bom_items").select("*").eq("active", true).order("sort_order");
  return <ProposalBuilder lead={lead} items={(items || []) as BomItem[]} />;
}
