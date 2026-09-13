import type { Metadata } from "next";
import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { BRAND_CATEGORIES, BRAND_PILLARS } from "@/content/offerings";

export const metadata: Metadata = solutionMetadata(
  "Leading Solar Brands",
  "Quality, reliability, performance, warranty and service support in the components Mr.GLOW RENEWABLES specifies.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Leading brands"
      headline="Leading Brands. Reliable Solar."
      intro="We don't compromise on the components that power your solar investment. Named OEM logos appear here only when Mr.GLOW RENEWABLES publishes the brands actually used on projects."
      points={BRAND_PILLARS.map((p) => `${p.title}: ${p.text}`)}
      benefits={BRAND_CATEGORIES.map((c) => `${c.name} — ${c.role}`)}
      cta={{ href: "/book-consultation", label: "Talk to a Solar Expert" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
    />
  );
}
