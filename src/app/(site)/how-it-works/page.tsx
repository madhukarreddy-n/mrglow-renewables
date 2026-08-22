import type { Metadata } from "next";
import { DetailedPath, JourneyCtas, SimplePath } from "@/components/site/journey-path";

export const metadata: Metadata = {
  title: "How It Works",
  description: "The simple Mr.GLOW solar path: calculate savings, consult, survey and design, then install, monitor and save.",
};

export default function Page() {
  return (
    <>
      <section className="bg-navy-deep py-20 text-white">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">Visual path</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl sm:text-5xl">
            Solar, in the simplest order
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            We take care of everything, so you can enjoy worry-free solar power. Start with your savings, then book a free consultation.
          </p>
          <JourneyCtas />
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-wide">
          <h2 className="font-display text-3xl">The path at a glance</h2>
          <p className="mt-3 max-w-xl text-muted">Four stages. Read left to right — or top to bottom on a phone.</p>
          <div className="mt-10">
            <SimplePath />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <h2 className="text-center font-display text-3xl">From first calculation to years of savings</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Same journey, with the engineering steps in between. Follow the line.
          </p>
          <div className="mt-14">
            <DetailedPath />
          </div>
          <div className="mt-8 flex justify-center">
            <JourneyCtas />
          </div>
        </div>
      </section>
    </>
  );
}
