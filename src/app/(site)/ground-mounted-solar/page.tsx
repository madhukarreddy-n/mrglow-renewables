import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Ground Mounted Solar",
  "Land-based solar arrays with engineering, monitoring and maintenance in mind.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Ground mounted"
      headline="Large-scale solar on land"
      intro="Ground-mounted systems use available land for scalable capacity. Soil, structure, electrical design and future expansion are assessed before a proposal is final."
      points={[
        "Large-scale solar and land utilisation",
        "Scalable capacity with room for future expansion",
        "Engineering, structural analysis and soil testing as required",
        "Monitoring and maintenance after commissioning",
      ]}
      benefits={[
        "Use land for generation",
        "Scale in phases",
        "Engineer for site conditions",
        "Monitor performance over time",
      ]}
      cta={{ href: "/book-consultation", label: "Discuss Your Project" }}
    />
  );
}
