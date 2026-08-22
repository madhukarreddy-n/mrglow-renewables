import Link from "next/link";
import { readSession } from "@/lib/auth/session";
import { SignOutButton } from "@/components/admin/sign-out";

export const dynamic = "force-dynamic";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/leads", "Leads"],
  ["/admin/pipeline", "Pipeline"],
  ["/admin/followups", "Follow-ups"],
  ["/admin/site-surveys", "Site Surveys"],
  ["/admin/quotations", "Quotations"],
  ["/admin/customers", "Customers"],
  ["/admin/plants", "Solar Plants"],
  ["/admin/generation", "Generation"],
  ["/admin/savings", "Savings"],
  ["/admin/service", "Service"],
  ["/admin/amc", "AMC"],
  ["/admin/warranties", "Warranties"],
  ["/admin/reports", "Reports"],
  ["/admin/projects", "Projects"],
  ["/admin/testimonials", "Testimonials"],
  ["/admin/faqs", "FAQs"],
  ["/admin/users", "Users"],
  ["/admin/settings", "Settings"],
  ["/admin/audit", "Audit Logs"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await readSession();
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#eef1ec] text-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto bg-navy-deep p-4 text-white md:block">
        <p className="px-2 text-xs uppercase tracking-[0.2em] text-lime">Mr.GLOW CRM</p>
        <nav className="mt-6 space-y-1 text-sm">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-3">
          <SignOutButton />
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-8">
          <div>
            <p className="font-display text-lg">Good day, {user.name}</p>
            <p className="text-xs text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {user.role}</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Link href="/admin/leads/new" className="btn-primary !py-2 text-xs">+ New Lead</Link>
            <Link href="/admin/site-surveys" className="btn-outline !py-2 text-xs">+ Survey</Link>
            <Link href="/admin/quotations" className="btn-outline !py-2 text-xs">+ Quotation</Link>
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
