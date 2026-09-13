import Link from "next/link";
import { getAuthUser, getSessionEmployee } from "@/lib/supabase/auth";
import { SignOutButton } from "@/components/admin/sign-out";

export const dynamic = "force-dynamic";

const LINKS = [
  ["/admin", "Pipeline"],
  ["/admin/leads", "Leads"],
  ["/admin/proposals", "Proposals"],
  ["/admin/bom", "BOM"],
  ["/admin/employees", "Team"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const employee = await getSessionEmployee();
  if (employee) {
    const links = employee.role === "admin" ? LINKS : LINKS.filter(([href]) => href !== "/admin/employees");
    return (
      <div className="min-h-screen bg-[#eef1ec] text-navy">
        <aside className="fixed inset-y-0 left-0 hidden w-56 overflow-y-auto bg-navy-deep p-4 text-white md:block">
          <p className="px-2 text-xs uppercase tracking-[0.2em] text-lime">Mr.GLOW staff</p>
          <nav className="mt-6 space-y-1 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 px-3">
            <SignOutButton />
          </div>
        </aside>
        <div className="md:pl-56">
          <header className="border-b bg-white px-4 py-3 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg">{employee.name}</p>
                <p className="text-xs text-muted">{employee.role}</p>
              </div>
              <Link href="/" className="text-xs font-semibold text-muted">
                View site
              </Link>
            </div>
            <nav className="mt-3 flex flex-wrap gap-2 md:hidden">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-full bg-mist px-3 py-1 text-xs">
                  {label}
                </Link>
              ))}
            </nav>
          </header>
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    );
  }

  const user = await getAuthUser();
  if (user) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-deep p-6 text-white">
        <div className="card max-w-md p-8 text-navy">
          <h1 className="font-display text-2xl">Signed in, but not on the staff list</h1>
          <p className="mt-3 text-sm text-muted">
            Auth user {user.email} has no row in <code>employees</code>. Sign out and use first-admin setup, or insert the row in the Supabase SQL editor.
          </p>
          <div className="mt-6">
            <SignOutButton className="btn-outline" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
