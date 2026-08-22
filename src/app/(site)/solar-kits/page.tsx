import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { KIT_POINTS } from "@/content/offerings";

export const metadata = solutionMetadata(
  "Pre-Wired Solar Kits",
  "Less wiring, faster installation and fewer hassles with pre-wired solar kits from Mr.GLOW RENEWABLES.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Solar kits"
      headline="Pre-Wired Solar Kits – Less Wiring. Faster Installation. Fewer Hassles."
      intro="Pre-wired kits are specified so more of the electrical work is prepared before the team is on the roof — sized for homes, farms and small businesses, with on-grid, hybrid or off-grid options depending on the site."
      points={KIT_POINTS.map((p) => `${p.title}: ${p.text}`)}
      benefits={[
        "Clear starting point for a defined need",
        "Professional installation by the Mr.GLOW team",
        "After-sales support",
      ]}
      cta={{ href: "/solar-calculator", label: "Calculate My Solar Savings" }}
      secondary={{ href: "/book-consultation", label: "Book Free Consultation" }}
    />
  );
}
