import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = { title: "Terms of Use" };

export default function Page() {
  return (
    <article>
      <section className="bg-navy py-16 text-white">
        <div className="container-wide">
          <h1 className="font-display text-4xl">Terms of Use</h1>
        </div>
      </section>
      <section className="section">
        <div className="container-wide max-w-3xl text-muted">
          <p>{BRAND.terms}</p>
        </div>
      </section>
      <GoldCta />
    </article>
  );
}
