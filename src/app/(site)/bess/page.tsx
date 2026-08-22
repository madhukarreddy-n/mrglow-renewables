import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "BESS",
  "Battery Energy Storage Systems — store energy, save more, stay powered. Mr.GLOW RENEWABLES PVT LTD.",
);

export default function Page() {
  return (
    <SolutionPage
      title="BESS"
      headline="Battery Energy Storage Systems"
      intro="Store energy. Save more. Stay powered."
      points={[
        "Peak shaving — reduce peak demand charges",
        "Backup power — uninterrupted power during outages",
        "Energy independence — store excess energy for later use",
        "Long battery life — advanced lithium-ion technology",
        "Smart monitoring — real-time monitoring & control",
      ]}
      benefits={["Store excess solar", "Stay powered during outages", "Monitor in real time"]}
      cta={{ href: "/book-consultation", label: "Book Free Consultation" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
    />
  );
}
