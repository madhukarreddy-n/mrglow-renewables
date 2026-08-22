import Link from "next/link";
import type { Metadata } from "next";

export function SolutionPage(props: {
  title: string;
  headline: string;
  intro: string;
  points: string[];
  benefits: string[];
  cta: { href: string; label: string };
  secondary?: { href: string; label: string };
  extra?: React.ReactNode;
}) {
  return (
    <article>
      <section className="bg-navy-deep py-20 text-white">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">{props.title}</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl sm:text-5xl">{props.headline}</h1>
          <p className="mt-6 max-w-2xl text-white/75">{props.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={props.cta.href} className="btn-primary">{props.cta.label}</Link>
            {props.secondary && (
              <Link href={props.secondary.href} className="btn-secondary">{props.secondary.label}</Link>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <ul className="space-y-3 text-muted">
            {props.points.map((p) => (
              <li key={p} className="rounded-2xl bg-white p-4">{p}</li>
            ))}
          </ul>
          <div className="card p-8">
            <h2 className="font-display text-2xl">Benefits</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {props.benefits.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>
        </div>
        {props.extra}
      </section>
    </article>
  );
}

export const solutionMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
});
