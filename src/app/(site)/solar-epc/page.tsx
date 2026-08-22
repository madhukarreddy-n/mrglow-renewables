import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Solar EPC",
  "End-to-end Engineering, Procurement & Construction services for solar projects — Mr.GLOW RENEWABLES PVT LTD.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Solar EPC"
      headline="End-to-end Engineering, Procurement & Construction"
      intro="Mr.GLOW RENEWABLES delivers EPC services for solar projects — from concept to commissioning."
      points={[
        "Engineering, procurement and construction under one team",
        "Site survey, design, installation and commissioning",
        "Quality components sourced for the project",
        "Support for applicable approvals and net metering",
      ]}
      benefits={["Single point of delivery", "Professional installation", "Monitoring after commissioning", "Long-term support"]}
      cta={{ href: "/solar-calculator", label: "Calculate My Solar Savings" }}
      secondary={{ href: "/book-consultation", label: "Book Free Consultation" }}
    />
  );
}
