import type { Metadata } from "next";
import { DetailedPath, SimplePath } from "@/components/site/journey-path";
import { PageHero, GoldCta, FaqBlock } from "@/components/site/page-chrome";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Book a consultation, review a proposal, install, then generate. The Mr.GLOW rooftop solar path.",
};

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="How it works"
        headline="Solar, in four steps — then the engineering in between"
        support="We take care of survey, design, install and net-metering support so you can focus on the proposal."
        image="/brand/brochure-4.jpg"
      />
      <section className="section bg-mist">
        <div className="container-wide">
          <h2 className="font-display text-3xl">The path at a glance</h2>
          <div className="mt-10">
            <SimplePath />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-wide">
          <h2 className="text-center font-display text-3xl">From first conversation to commissioning</h2>
          <div className="mt-14">
            <DetailedPath />
          </div>
        </div>
      </section>
      <FaqBlock />
      <GoldCta />
    </article>
  );
}
