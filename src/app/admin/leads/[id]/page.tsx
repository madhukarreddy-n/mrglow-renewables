import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { LeadWorkspace } from "@/components/admin/lead-workspace";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let employee;
  try {
    employee = await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) redirect("/admin/leads");

  const { data: history } = await supabase
    .from("status_history")
    .select("*")
    .eq("lead_id", id)
    .order("changed_at", { ascending: true });
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  let employees: { id: string; name: string; email: string }[] = [];
  if (employee.role === "admin") {
    const { data } = await supabase.from("employees").select("id, name, email").order("name");
    employees = data || [];
  }

  return (
    <LeadWorkspace
      lead={lead}
      history={history || []}
      proposals={proposals || []}
      employees={employees}
      isAdmin={employee.role === "admin"}
    />
  );
}
