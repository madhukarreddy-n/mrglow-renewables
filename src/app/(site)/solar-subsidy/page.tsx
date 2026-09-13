import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, FourSteps, FaqBlock, GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = {
  title: "Solar Subsidy",
  description: "How residential rooftop subsidy typically works in India, and how Mr.GLOW helps you check eligibility after survey.",
};

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="Solar subsidy"
        headline="Check what may apply to your rooftop"
        support="Residential grid-tied systems may qualify under current central rules. Commercial and industrial plants generally do not. Amounts and documents change — confirm at survey."
        image="/brand/brochure-3.jpg"
      />
      <section className="section">
        <div className="container-wide max-w-3xl space-y-6 text-muted">
          <p>
            India currently runs a residential rooftop programme (often referred to as PM Surya Ghar) with capacity-based
            central financial assistance. Typical public slabs discussed in the market are higher for the first few kW
            and capped. This website does not lock a rupee figure because policy, ALMM lists and DISCOM processes change.
          </p>
          <ul className="space-y-3">
            <li className="rounded-xl bg-mist p-4 text-navy">Usually for eligible residential rooftops, not shops or factories.</li>
            <li className="rounded-xl bg-mist p-4 text-navy">Often excludes battery-only / off-grid packages.</li>
            <li className="rounded-xl bg-mist p-4 text-navy">Your calculator may show an estimate; the proposal states what we will actually apply for.</li>
          </ul>
          <p>
            Mr.GLOW RENEWABLES PVT LTD helps with documentation where we are the installer. We do not pay a “company discount”
            advertised as part of a national scheme.
          </p>
          <Link href="/solar-calculator" className="btn-quote inline-flex">
            Estimate with the calculator
          </Link>
        </div>
      </section>
      <FourSteps />
      <FaqBlock />
      <GoldCta />
    </article>
  );
}
