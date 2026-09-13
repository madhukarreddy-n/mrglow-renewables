import type { Metadata } from "next";
import { BROCHURE } from "@/content/brochure";
import { PageHero, FourSteps, GoldCta, FaqBlock } from "@/components/site/page-chrome";

export const metadata: Metadata = { title: "Why Mr.GLOW" };

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow={BROCHURE.tagline}
        headline="Why choose Mr.GLOW?"
        support="From the company brochure: experienced team, quality components, end-to-end service and after-sales support. We do not publish awards or partner logos we cannot verify."
        image="/brand/brochure-3.jpg"
      />
      <section className="section">
        <div className="container-wide grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {BROCHURE.why.map(([t, d]) => (
            <div key={t} className="card p-6">
              <h2 className="font-display text-xl">{t}</h2>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <FourSteps />
      <FaqBlock />
      <GoldCta />
    </article>
  );
}
