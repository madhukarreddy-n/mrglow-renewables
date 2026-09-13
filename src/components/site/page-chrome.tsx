import Link from "next/link";
import Image from "next/image";
import { QuoteWizard } from "@/components/site/quote-wizard";
import { SIMPLE_PATH } from "@/content/journey";
import { BRAND } from "@/lib/brand";

export function PageHero({
  eyebrow,
  headline,
  support,
  image = "/brand/brochure-1.jpg",
}: {
  eyebrow: string;
  headline: string;
  support: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      <Image src={image} alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/92 via-navy-deep/75 to-navy-deep/35" />
      <div className="container-wide relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{headline}</h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">{support}</p>
        </div>
        <div id="quote">
          <QuoteWizard />
        </div>
      </div>
    </section>
  );
}

export function FourSteps() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="container-wide">
        <h2 className="text-center font-display text-3xl">Choose solar in 4 easy steps</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {SIMPLE_PATH.map((s) => (
            <li key={s.n} className="rounded-xl border border-white/15 bg-white/5 p-5">
              <p className="font-display text-3xl text-gold">{s.n}</p>
              <h3 className="mt-2 font-display text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-white/70">{s.plain}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export const SITE_FAQS: [string, string][] = [
  [
    `What is ${BRAND.brandName}?`,
    `${BRAND.legalName} installs rooftop and related solar systems for homes, businesses and industry from Hyderabad. We survey the site, propose a price, and install after you confirm.`,
  ],
  [
    "What is a rooftop solar system?",
    "Panels on the roof generate DC electricity. An inverter converts it to AC for your loads. On-grid systems can export surplus through net metering where your DISCOM allows it.",
  ],
  [
    "How do I size the plant?",
    "Start with your monthly bill in the calculator. Final size depends on roof area, shade, sanctioned load and your goals. That is confirmed at survey — not from the website estimate alone.",
  ],
  [
    "Is government subsidy available?",
    "Central rooftop subsidy for eligible residential systems is administered under current government rules (often discussed as PM Surya Ghar). Eligibility, slabs and documents change. We help you check what applies to your site; we do not guarantee an amount on this website.",
  ],
  [
    "How long do panels typically last?",
    "Quality modules are commonly warrantied around 25 years for performance. Actual generation depends on product, installation, weather and cleaning. Warranties are those of the manufacturers named in your proposal.",
  ],
  [
    "Are website savings a quotation?",
    "No. Calculator and subsidy figures are estimates. Price, taxes, net metering and timeline are in the proposal after survey.",
  ],
];

export function FaqBlock({ items = SITE_FAQS }: { items?: [string, string][] }) {
  return (
    <section className="section">
      <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-3xl">Have a specific question?</h2>
          <p className="mt-3 text-muted">Speak with a specialist for guidance on your roof and bill.</p>
          <Link href="/contact" className="btn-quote mt-6 inline-flex">
            Call us
          </Link>
        </div>
        <div className="divide-y divide-navy/10 rounded-xl border border-navy/10">
          {items.map(([q, a]) => (
            <details key={q} className="p-5">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-3 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GoldCta({ title = "Ready to see what solar can save you?" }: { title?: string }) {
  return (
    <section className="bg-gold py-14 text-navy-deep">
      <div className="container-wide text-center">
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/#quote" className="rounded-md bg-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white">
            Get a Quote!
          </Link>
          <Link href="/solar-calculator" className="btn-primary">
            Calculate savings
          </Link>
        </div>
      </div>
    </section>
  );
}
