import { prisma } from "@/lib/db";

export default async function TestimonialsAdmin() {
  const rows = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-2xl">Testimonials</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((t) => (
          <li key={t.id} className="rounded-2xl bg-white p-4">
            {t.customerName} · {t.approved ? "approved" : "pending"} — {t.quote}
          </li>
        ))}
        {rows.length === 0 && <p className="text-muted">None yet. Add only real customer quotes.</p>}
      </ul>
    </div>
  );
}
