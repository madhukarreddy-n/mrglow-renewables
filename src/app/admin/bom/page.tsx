import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { BomManager } from "@/components/admin/bom-manager";
import type { BomItem } from "@/lib/bom";

export const dynamic = "force-dynamic";

export default async function BomPage() {
  let employee;
  try {
    employee = await requireEmployee();
  } catch {
    redirect("/admin/login");
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("bom_items").select("*").order("sort_order").order("category");
  return (
    <div>
      <h1 className="font-display text-3xl">BOM</h1>
      <p className="mt-1 text-sm text-muted">Material list and brand prices used on estimates. Admins can update cost.</p>
      <div className="mt-6">
        <BomManager items={(data || []) as BomItem[]} isAdmin={employee.role === "admin"} />
      </div>
    </div>
  );
}
