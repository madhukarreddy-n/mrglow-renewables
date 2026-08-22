import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Residential Solar",
  "Rooftop solar for homes — bill reduction, net metering support, design, installation and monitoring with Mr.GLOW RENEWABLES PVT LTD.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Residential"
      headline="Power Your Home With the Sun"
      intro="Rooftop solar sized to your electricity use, with clear estimates for generation, investment and estimated subsidy where it may apply."
      points={[
        "Rooftop solar for homes",
        "Electricity bill reduction through on-site generation",
        "Government subsidy estimated where applicable (DCR programmes — not guaranteed)",
        "Net metering support for applicable DISCOM processes",
        "DCR / Non-DCR options explained before you decide",
        "Solar system design, installation, monitoring and maintenance",
      ]}
      benefits={[
        "Reduce electricity bills",
        "Increase property value",
        "Low maintenance",
        "Generate your own electricity",
        "Increase energy independence",
      ]}
      cta={{ href: "/solar-calculator", label: "Calculate My Residential Solar Savings" }}
      secondary={{ href: "/book-consultation", label: "Book Free Consultation" }}
    />
  );
}
