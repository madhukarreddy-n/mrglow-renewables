import Link from "next/link";
import type { Metadata } from "next";
import { PageHero, FourSteps, FaqBlock, GoldCta } from "@/components/site/page-chrome";

export function SolutionPage(props: {
  title: string;
  headline: string;
  intro: string;
  points: string[];
  benefits: string[];
  cta: { href: string; label: string };
  secondary?: { href: string; label: string };
  extra?: React.ReactNode;
  image?: string;
}) {
  return (
    <article>
      <PageHero eyebrow={props.title} headline={props.headline} support={props.intro} image={props.image} />
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <ul className="space-y-3">
            {props.points.map((p) => (
              <li key={p} className="rounded-xl bg-mist p-4 text-navy">
                {p}
              </li>
            ))}
          </ul>
          <div className="card p-8">
            <h2 className="font-display text-2xl">Benefits</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {props.benefits.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={props.cta.href} className="btn-quote">
                {props.cta.label}
              </Link>
              {props.secondary ? (
                <Link href={props.secondary.href} className="btn-outline">
                  {props.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        {props.extra}
      </section>
      <FourSteps />
      <FaqBlock />
      <GoldCta />
    </article>
  );
}

export const solutionMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
});
