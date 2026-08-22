import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Commercial Solar",
  "Rooftop solar for offices, hotels, hospitals, schools, warehouses and retail — focused on operating cost and ROI estimates.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Commercial"
      headline="Cut operating electricity cost with rooftop solar"
      intro="Commercial buildings often have daytime loads that align well with solar generation. We design around consumption, roof utilisation and monitoring."
      points={[
        "Offices, hotels, hospitals, schools, warehouses and retail",
        "Apartment common areas",
        "Electricity cost and operating expense reduction",
        "ROI and payback presented as estimates with assumptions",
        "Rooftop utilisation, monitoring and maintenance",
      ]}
      benefits={[
        "Lower operating costs",
        "Improve energy efficiency",
        "Sustainable business growth",
        "Professional engineering",
        "Generation monitoring",
      ]}
      cta={{ href: "/solar-calculator", label: "Calculate Commercial Solar Savings" }}
      secondary={{ href: "/book-consultation", label: "Book Free Consultation" }}
    />
  );
}
