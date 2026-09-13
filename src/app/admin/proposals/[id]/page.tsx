import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { ProposalDetail } from "@/components/admin/proposal-detail";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, leads(name)")
    .eq("id", id)
    .maybeSingle();
  if (!proposal) redirect("/admin/proposals");
  const { data: photos } = await supabase
    .from("proposal_photos")
    .select("id, caption, uploaded_at")
    .eq("proposal_id", id)
    .order("uploaded_at", { ascending: true });
  const lead = Array.isArray(proposal.leads) ? proposal.leads[0] : proposal.leads;
  return (
    <ProposalDetail
      proposal={proposal}
      photos={photos || []}
      leadName={lead?.name || "Lead"}
    />
  );
}
