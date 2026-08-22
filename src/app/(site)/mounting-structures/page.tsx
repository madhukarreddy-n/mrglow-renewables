import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { STRUCTURES } from "@/content/offerings";

export const metadata = solutionMetadata(
  "Solar Mounting Structures",
  "0.5 m, 1 m and 2 m mounting structures selected for roof type and site conditions.",
);

export default function Page() {
  return (
    <SolutionPage
      title="Mounting structures"
      headline="Built to Last. Mounted for the Long Run."
      intro="The mounting structure is critical for long-term solar reliability. Height, material and fixing method should be selected from the roof type, wind exposure, tilt requirement and structural capacity of the site — by survey, not by a generic catalogue promise."
      points={STRUCTURES.map((s) => `${s.title}: ${s.use}`)}
      benefits={[
        "Professionally engineered for the site, not a one-size stand",
        "Specified with the roof or ground condition in mind",
        "Durable hardware intended for years of outdoor service",
      ]}
      cta={{ href: "/book-consultation", label: "Discuss Your Roof" }}
      secondary={{ href: "/tin-shed-solar", label: "Metal / tin shed options" }}
      extra={
        <div className="container-wide mt-12 grid gap-6 md:grid-cols-3">
          {STRUCTURES.map((s) => (
            <div key={s.title} className="card overflow-hidden p-0">
              <div className="flex h-40 items-end justify-center bg-navy-deep px-6 pb-4">
                <div
                  className="w-24 rounded-t-md bg-lime"
                  style={{ height: s.height === "0.5 m" ? "28%" : s.height === "1 m" ? "52%" : "88%" }}
                  aria-hidden
                />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-muted">{s.height} stand-off</p>
                <h3 className="mt-1 font-display text-xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted">{s.use}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {s.benefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <p className="md:col-span-3 text-xs text-muted">
            Heights are typical product families used to discuss clearance and geometry. Final structure, steel grade and fixings follow site survey and structural checks. We do not quote a guaranteed calendar lifespan independent of the site.
          </p>
        </div>
      }
    />
  );
}
