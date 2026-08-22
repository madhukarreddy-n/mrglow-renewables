import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { TIN_SHED } from "@/content/offerings";

export const metadata = solutionMetadata(
  "Solar for Tin Sheds",
  "Adhesive, trapezoidal and standing-seam mounting options that reduce unnecessary roof puncturing.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Tin shed / metal roof"
      headline="Solar for Tin Sheds – Without Unnecessary Roof Puncturing."
      intro="Metal roofs can take solar without treating every sheet like an RCC slab. The aim is fewer penetrations, lower leakage concern, a cleaner finish and a faster install — when the profile and structure allow it."
      points={[
        "Reduced roof penetration where the chosen method is compatible with the sheet profile",
        "Reduced leakage concerns compared with indiscriminate through-bolting",
        "Cleaner installation along ribs or seams",
        "Faster installation when rails and clamps match the roof",
        "The final solution depends on the actual roof profile and structural/site conditions",
      ]}
      benefits={TIN_SHED.map((t) => t.title)}
      cta={{ href: "/book-consultation", label: "Assess My Metal Roof" }}
      secondary={{ href: "/mounting-structures", label: "Structure heights" }}
      extra={
        <div className="container-wide mt-10 grid gap-6 md:grid-cols-3">
          {TIN_SHED.map((t) => (
            <div key={t.title} className="card p-6">
              <h3 className="font-display text-xl">{t.title}</h3>
              <p className="mt-3 text-sm text-muted">{t.text}</p>
            </div>
          ))}
          <p className="md:col-span-3 text-sm text-muted">
            Adhesive, trapezoidal rails and standing-seam rails are options, not a promise that every tin shed can avoid all penetrations. Sheet thickness, coating, span, wind zone and existing leaks are checked on site.
          </p>
        </div>
      }
    />
  );
}
