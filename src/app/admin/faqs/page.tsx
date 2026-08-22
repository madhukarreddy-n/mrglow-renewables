import { prisma } from "@/lib/db";
import { saveFaq } from "../actions";

export default async function FaqsAdmin() {
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="font-display text-2xl">FAQs</h1>
      <ul className="mt-6 space-y-4">
        {faqs.map((f) => (
          <li key={f.id} className="rounded-2xl bg-white p-4">
            <p className="font-semibold">{f.question}</p>
            <p className="text-sm text-muted">{f.answer}</p>
            <form action={saveFaq} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={f.id} />
              <input name="question" defaultValue={f.question} />
              <textarea name="answer" defaultValue={f.answer} />
              <label className="flex gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={f.published} /> Published</label>
              <button className="btn-outline !py-1 text-xs">Update</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
