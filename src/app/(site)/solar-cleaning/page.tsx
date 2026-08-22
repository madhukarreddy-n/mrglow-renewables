import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { CLEANING } from "@/content/offerings";

export const metadata = solutionMetadata(
  "Solar Cleaning & Maintenance",
  "Clean panels, more sunlight, better generation — schedule cleaning or request maintenance with Mr.GLOW RENEWABLES.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Cleaning & maintenance"
      headline="Clean Panels. More Sunlight. Better Generation."
      intro="Dust, dirt, bird droppings and other deposits can reduce sunlight reaching the panels and affect generation. Cleaning and a structured maintenance visit keep the plant visible and serviceable."
      points={CLEANING.map((c) => `${c.title}: ${c.text}`)}
      benefits={[
        "Better performance after soiling is removed",
        "Improved energy generation versus a neglected array",
        "Long-term system care",
        "Early identification of issues",
      ]}
      cta={{ href: "/book-consultation?intent=maintenance", label: "Schedule Cleaning / Request Maintenance" }}
      secondary={{ href: "/contact", label: "WhatsApp an Expert" }}
    />
  );
}
