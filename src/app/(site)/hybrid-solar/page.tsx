import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata("Hybrid Solar", "Solar + battery + grid for uninterrupted power.");

export default function Page() {
  return (
    <SolutionPage
      title="Hybrid"
      headline="Hybrid solar systems"
      intro="Solar + battery + grid for uninterrupted power and smart energy management."
      points={["Solar generation with battery storage and grid backup", "Useful where outages or peak tariffs matter", "Monitoring and professional installation"]}
      benefits={["Uninterrupted power", "Store excess energy", "Stay connected to the grid"]}
      cta={{ href: "/book-consultation", label: "Book Free Consultation" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
    />
  );
}
