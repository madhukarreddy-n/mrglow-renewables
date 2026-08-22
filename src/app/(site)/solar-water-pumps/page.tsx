import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata("Solar Water Pumps", "Reliable solar pumping solutions for agriculture and rural areas.");

export default function Page() {
  return (
    <SolutionPage
      title="Solar water pumps"
      headline="Solar pumping for agriculture and rural areas"
      intro="Reliable solar pumping solutions from Mr.GLOW RENEWABLES PVT LTD."
      points={["Power pumps with solar instead of diesel or unreliable grid supply", "Sized after understanding water and energy need", "Installation and support from the Mr.GLOW team"]}
      benefits={["Lower running cost vs diesel", "Useful for farms and rural sites", "Clean energy for pumping"]}
      cta={{ href: "/book-consultation", label: "Book Free Consultation" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
    />
  );
}
