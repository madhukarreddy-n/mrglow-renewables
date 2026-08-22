import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Gated Community Solar",
  "Solar designed for clubhouse, common-area, lifts, pumps, lighting and community utilities.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Gated communities"
      headline="Solar designed for the energy needs of your entire community."
      intro="Common-area electricity is a long-term operating cost. Solar can be designed around clubhouse, lifts, pumps, security, lighting and other shared loads."
      points={[
        "Clubhouse and common-area electricity",
        "Lifts, pumps and security loads",
        "Street lighting and EV charging where applicable",
        "Swimming pools and other shared utilities",
        "Monitoring and long-term support for the association",
      ]}
      benefits={[
        "Lower common-area electricity expenses",
        "Better long-term operating economics",
        "Sustainable community",
        "Monitoring",
        "Professional installation",
        "Long-term support",
      ]}
      cta={{ href: "/book-consultation", label: "Get a Community Solar Assessment" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Savings" }}
    />
  );
}
