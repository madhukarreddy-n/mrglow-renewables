import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";

export const metadata = solutionMetadata(
  "Industrial Solar",
  "High-consumption industrial solar — rooftop, ground-mounted and scalable systems with engineering-led design.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Industrial"
      headline="Solar for high electricity consumption"
      intro="Manufacturing, warehouses, cold storage and large facilities can use rooftop or land-based solar. Regulatory structures such as open access or group captive are discussed only when they apply to the project — they are not assumed."
      points={[
        "Large rooftop systems and ground-mounted options",
        "Engineering, structural design and electrical safety",
        "Generation monitoring and long-term savings estimates",
        "Scalability as consumption grows",
        "Potential structures: industrial rooftop, ground mounted, open access or group captive — confirmed case by case",
      ]}
      benefits={[
        "High-capacity installations",
        "Long-term energy security",
        "Protect against rising tariffs",
        "Track generation after commissioning",
        "Maintain systems over the long term",
      ]}
      cta={{ href: "/book-consultation", label: "Talk to a Solar Expert" }}
    />
  );
}
