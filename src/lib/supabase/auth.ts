import { createServerSupabase } from "./server";

export type Employee = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "employee";
};

export async function getAuthUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionEmployee(): Promise<Employee | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("employees")
    .select("id, auth_user_id, name, email, phone, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return (data as Employee | null) ?? null;
}

export async function requireEmployee() {
  const employee = await getSessionEmployee();
  if (!employee) {
    const err = new Error("Unauthorized");
    (err as { status?: number }).status = 401;
    throw err;
  }
  return employee;
}

export async function requireAdmin() {
  const employee = await requireEmployee();
  if (employee.role !== "admin") {
    const err = new Error("Forbidden");
    (err as { status?: number }).status = 403;
    throw err;
  }
  return employee;
}
