import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata("On-Grid Solar", "Grid-connected systems to reduce electricity bills and generate clean energy.");

export default function Page() {
  return (
    <SolutionPage
      title="On-grid"
      headline="On-grid solar systems"
      intro="Connect to the grid and reduce electricity bills."
      points={["Grid-connected generation", "Lower bills and higher savings potential", "Net metering support where it applies"]}
      benefits={["Lower bills", "Clean energy", "Use the grid when you need it"]}
      cta={{ href: "/solar-calculator", label: "Calculate My Solar Savings" }}
      secondary={{ href: "/book-consultation", label: "Book Free Consultation" }}
    />
  );
}
