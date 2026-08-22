import type { Metadata } from "next";
import { CalculatorWizard } from "@/components/calculator/wizard";

export const metadata: Metadata = {
  title: "Solar Savings Calculator",
  description: "Estimate solar system size, generation, savings, estimated subsidy, payback and ROI.",
};

export default function Page() {
  return (
    <section className="section">
      <div className="container-wide max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">Guided estimate</p>
        <h1 className="mt-2 font-display text-4xl">Solar Savings Calculator</h1>
        <p className="mt-3 text-muted">
          Three short steps. You will see results before we ask for your contact details.
        </p>
        <CalculatorWizard />
      </div>
    </section>
  );
}
