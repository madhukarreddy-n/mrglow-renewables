import type { Metadata } from "next";
import Link from "next/link";
import { BROCHURE } from "@/content/brochure";

export const metadata: Metadata = { title: "Why Mr.GLOW" };

export default function Page() {
  return (
    <section className="section">
      <div className="container-wide">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">{BROCHURE.tagline}</p>
        <h1 className="mt-3 font-display text-4xl">Why Choose Mr.GLOW?</h1>
        <p className="mt-4 max-w-2xl text-muted">
          From the company brochure — experienced team, quality components, end-to-end service and after-sales support.
          Awards and certifications are shown only if entered in Admin.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {BROCHURE.why.map(([t, d]) => (
            <div key={t} className="card p-6">
              <h2 className="font-display text-xl">{t}</h2>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/solar-calculator" className="btn-primary">Calculate My Solar Savings</Link>
          <Link href="/book-consultation" className="btn-outline">Book Free Consultation</Link>
        </div>
      </div>
    </section>
  );
}
