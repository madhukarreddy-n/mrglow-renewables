import type { Metadata } from "next";
import { PageHero, FourSteps, GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="Projects"
        headline="Installations we can show"
        support="Only verified Mr.GLOW photographs will appear here. We do not publish sample or third-party projects."
        image="/brand/brochure-8.jpg"
      />
      <section className="section">
        <div className="container-wide">
          <p className="rounded-xl border border-dashed border-navy/20 p-10 text-muted">
            No published case studies yet. Staff can attach installation photos on a shared proposal when a job is complete.
          </p>
        </div>
      </section>
      <FourSteps />
      <GoldCta />
    </article>
  );
}
