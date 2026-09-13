import type { Metadata } from "next";
import { CalculatorWizard } from "@/components/calculator/wizard";
import { PageHero, FourSteps, FaqBlock, GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = {
  title: "Solar Savings Calculator",
  description: "Estimate solar system size, generation, savings, estimated subsidy, payback and ROI.",
};

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="Solar calculator"
        headline="Calculate your rooftop solar savings"
        support="Enter your bill, see an estimate, then request a quote. Results are not a quotation."
        image="/brand/brochure-7.jpg"
      />
      <section className="bg-[#eef8e8] py-16">
        <div className="container-wide max-w-3xl">
          <CalculatorWizard />
        </div>
      </section>
      <FourSteps />
      <FaqBlock />
      <GoldCta />
    </article>
  );
}
