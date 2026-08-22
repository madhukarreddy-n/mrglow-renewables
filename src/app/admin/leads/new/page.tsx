import { createLead } from "../../actions";
import { redirect } from "next/navigation";
import { INDIAN_STATES } from "@/lib/india-states";

export default function NewLeadPage() {
  async function action(formData: FormData) {
    "use server";
    const id = await createLead(formData);
    redirect(`/admin/leads/${id}`);
  }
  return (
    <form action={action} className="max-w-lg space-y-3 rounded-2xl bg-white p-6">
      <h1 className="font-display text-2xl">New lead</h1>
      <input name="name" required placeholder="Full name" />
      <input name="phone" required placeholder="10-digit phone" />
      <input name="email" type="email" placeholder="Email" />
      <select name="state" defaultValue="TS">
        {INDIAN_STATES.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
      <select name="category">
        <option>RESIDENTIAL</option>
        <option>COMMERCIAL</option>
        <option>INDUSTRIAL</option>
      </select>
      <button className="btn-primary">Create</button>
    </form>
  );
}
