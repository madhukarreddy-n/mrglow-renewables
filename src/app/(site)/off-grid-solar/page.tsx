import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata("Off-Grid Solar", "Independent power for remote locations and farms.");

export default function Page() {
  return (
    <SolutionPage
      title="Off-grid"
      headline="Off-grid solar systems"
      intro="Independent power for remote locations and farms."
      points={["Designed where the grid is weak or unavailable", "Paired with storage as required", "Engineering based on site conditions"]}
      benefits={["Energy independence", "Remote and farm applications", "Mr.GLOW installation support"]}
      cta={{ href: "/book-consultation", label: "Book Free Consultation" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
    />
  );
}
