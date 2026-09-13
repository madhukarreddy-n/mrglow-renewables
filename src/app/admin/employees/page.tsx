import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { EmployeesManager } from "@/components/admin/employees-manager";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  try {
    await requireAdmin();
  } catch (e) {
    const status = (e as { status?: number }).status;
    redirect(status === 403 ? "/admin" : "/admin/login");
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("employees").select("id, name, email, role").order("name");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Team</h1>
      <EmployeesManager employees={data || []} />
    </div>
  );
}
