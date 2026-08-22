import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveCompanySettings, saveFaq, saveProject, saveTestimonial, updateCalculatorConfig } from "../actions";

export default async function SettingsPage() {
  const settings = await getSettings();
  const configs = await prisma.calculatorConfig.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  const subsidies = await prisma.subsidyConfig.findMany({ take: 5 });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Settings</h1>
      <form action={saveCompanySettings} className="space-y-3 rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl">Company & website</h2>
        <p className="text-sm text-muted">Edit JSON carefully. Contact details drive WhatsApp, call and emails.</p>
        <textarea name="json" rows={16} defaultValue={JSON.stringify(settings, null, 2)} />
        <label className="flex items-center gap-2 text-sm">
          Set publishStatistics true only after real numbers are verified. Demo stats must stay off the public site.
        </label>
        <button className="btn-primary">Save settings</button>
      </form>
      <section className="rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl">Calculator configuration</h2>
        {configs.map((c) => (
          <form key={c.id} action={updateCalculatorConfig} className="mt-4 grid gap-2 border-t py-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={c.id} />
            <p className="sm:col-span-2 text-sm">{c.name} · v{c.version} · {c.stateCode || "all states"}</p>
            <label className="text-sm">Peak sun hours<input name="peakSunHours" defaultValue={Number(c.peakSunHours)} /></label>
            <label className="text-sm">₹ / kWp<input name="systemCostPerKwp" defaultValue={Number(c.systemCostPerKwp)} /></label>
            <label className="text-sm">Efficiency<input name="systemEfficiency" defaultValue={Number(c.systemEfficiency)} /></label>
            <label className="text-sm">Panel W<input name="panelWattage" defaultValue={c.panelWattage} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={c.active} /> Active</label>
            <button className="btn-outline">Update</button>
          </form>
        ))}
        <div className="mt-6 text-sm">
          <h3 className="font-semibold">Subsidy configs (versioned)</h3>
          {subsidies.map((s) => (
            <p key={s.id}>{s.name} · max ₹{Number(s.maxSubsidy)} · {s.subsidyType}</p>
          ))}
        </div>
      </section>
      <form action={saveFaq} className="space-y-2 rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl">Add FAQ</h2>
        <input name="question" placeholder="Question" required />
        <textarea name="answer" placeholder="Answer" required />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Published</label>
        <button className="btn-outline">Save FAQ</button>
      </form>
      <form action={saveTestimonial} className="space-y-2 rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl">Add testimonial</h2>
        <p className="text-xs text-muted">Only approved testimonials appear publicly. Do not invent quotes.</p>
        <input name="customerName" required placeholder="Customer name" />
        <input name="company" placeholder="Company" />
        <input name="location" placeholder="Location" />
        <input name="category" placeholder="Category" />
        <input name="systemCapacity" placeholder="System capacity" />
        <textarea name="quote" required placeholder="Testimonial" />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="approved" /> Approved</label>
        <button className="btn-outline">Save</button>
      </form>
      <form action={saveProject} className="space-y-2 rounded-2xl bg-white p-6">
        <h2 className="font-display text-xl">Add project</h2>
        <input name="name" required placeholder="Project name" />
        <input name="location" placeholder="Location" />
        <select name="category">
          <option>Residential</option>
          <option>Gated Community</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Ground Mounted</option>
        </select>
        <input name="capacityKwp" type="number" step="0.01" placeholder="kWp" />
        <textarea name="description" placeholder="Description" />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="published" /> Publish on website</label>
        <button className="btn-outline">Save project</button>
      </form>
    </div>
  );
}
