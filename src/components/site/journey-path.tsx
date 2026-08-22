import Link from "next/link";
import { FULL_PATH, SIMPLE_PATH } from "@/content/journey";

export function SimplePath({ dark = false }: { dark?: boolean }) {
  const line = dark ? "bg-lime" : "bg-lime";
  const card = dark ? "border-white/15 bg-white/8 text-white" : "border-navy/10 bg-white text-navy";
  const muted = dark ? "text-white/70" : "text-muted";

  return (
    <ol className="relative grid gap-0 sm:grid-cols-4">
      <span
        className={`pointer-events-none absolute left-[1.15rem] top-6 hidden h-0.5 w-[calc(100%-2.3rem)] sm:block ${line} opacity-70`}
        aria-hidden
      />
      {SIMPLE_PATH.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
          {i < SIMPLE_PATH.length - 1 && (
            <span className={`absolute bottom-0 left-[1.1rem] top-12 w-0.5 sm:hidden ${line} opacity-70`} aria-hidden />
          )}
          <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime font-display text-lg font-bold text-navy-deep shadow-[0_0_0_6px_rgba(124,179,66,0.25)]">
            {step.n}
          </span>
          <div className={`mt-0 flex-1 rounded-2xl border p-4 sm:mt-5 ${card}`}>
            <p className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {step.you ? "You" : "Mr.GLOW"}
            </p>
            <h3 className="mt-1 font-display text-lg">{step.title}</h3>
            <p className={`mt-2 text-sm ${muted}`}>{step.plain}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DetailedPath() {
  return (
    <ol className="relative mx-auto max-w-3xl">
      <span className="absolute bottom-8 left-6 top-8 w-0.5 bg-gradient-to-b from-lime via-gold to-lime md:left-1/2 md:-translate-x-px" aria-hidden />
      {FULL_PATH.map((step, i) => {
        const left = i % 2 === 0;
        return (
          <li
            key={step.n}
            className={`relative mb-8 flex md:mb-4 ${left ? "md:justify-start" : "md:justify-end"}`}
          >
            <div className={`w-full pl-16 md:w-[calc(50%-2rem)] md:pl-0 ${left ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
              <article className="card p-5">
                <p className="font-display text-sm text-lime">{step.n}</p>
                <h3 className="font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-navy">{step.plain}</p>
                <p className="mt-2 text-sm text-muted">{step.detail}</p>
              </article>
            </div>
            <span className="absolute left-4 top-6 z-10 h-5 w-5 rounded-full border-4 border-white bg-lime shadow md:left-1/2 md:-translate-x-1/2" />
          </li>
        );
      })}
    </ol>
  );
}

export function JourneyCtas() {
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/solar-calculator" className="btn-primary">
        1. Calculate my savings
      </Link>
      <Link href="/book-consultation" className="btn-outline">
        2. Book free consultation
      </Link>
    </div>
  );
}
