import Link from "next/link";
import { BRAND_CATEGORIES, BRAND_PILLARS } from "@/content/offerings";

export function LeadingBrandsSection({
  brands,
}: {
  brands: { id: string; name: string; category: string; highlight: string | null }[];
}) {
  return (
    <section className="section bg-white" id="brands">
      <div className="container-wide">
        <p className="text-xs uppercase tracking-[0.25em] text-lime">Components</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Leading Brands. Reliable Solar.</h2>
        <p className="mt-4 max-w-2xl text-lg text-navy">
          We don&apos;t compromise on the components that power your solar investment.
        </p>
        <p className="mt-3 max-w-2xl text-muted">
          Quality, reliability, performance, warranty and service support are specified together — so the array you see is backed by parts that can be supported in the field.
        </p>
        {brands.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b) => (
              <div key={b.id} className="card p-6">
                <p className="text-xs uppercase tracking-wide text-muted">{b.category}</p>
                <h3 className="mt-2 font-display text-xl">{b.name}</h3>
                {b.highlight ? <p className="mt-2 text-sm text-muted">{b.highlight}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BRAND_CATEGORIES.map((b) => (
              <div key={b.name} className="rounded-3xl border border-navy/10 bg-sand p-5">
                <h3 className="font-display text-lg">{b.name}</h3>
                <p className="mt-2 text-sm text-muted">{b.role}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {BRAND_PILLARS.map((p) => (
            <div key={p.title} className="rounded-3xl border border-navy/8 p-6">
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.text}</p>
            </div>
          ))}
        </div>
        <Link href="/brands" className="mt-8 inline-block text-sm font-semibold text-navy">
          How we specify components →
        </Link>
      </div>
    </section>
  );
}
