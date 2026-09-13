import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { BROCHURE } from "@/content/brochure";
import { LeadingBrandsSection } from "@/components/site/leading-brands";
import { KIT_POINTS, STRUCTURES, TIN_SHED, CLEANING } from "@/content/offerings";
import { QuoteWizard } from "@/components/site/quote-wizard";
import { HomeCalculator } from "@/components/site/home-calculator";
import { SIMPLE_PATH } from "@/content/journey";
import { telLink } from "@/lib/utils";

const HIGHLIGHTS = [
  {
    title: "Rooftop solar, done properly",
    text: "Cable trays, earthing and electrical protection specified with the array — not added later.",
  },
  {
    title: "Clear proposal after survey",
    text: "Calculator figures are estimates. Size, subsidy eligibility and price are confirmed on site.",
  },
  {
    title: "Cleaning & after-sales",
    text: "Dust cuts generation. Ask us to schedule cleaning or maintenance when you need it.",
  },
];

const FAQS = [
  ["How do I start?", "Share your details in the quote form or run the calculator. A specialist follows up on WhatsApp or phone."],
  ["Are calculator numbers a quote?", "No. They are estimates. Price, subsidy and design are confirmed after a survey of your site."],
  ["Do you work only in Hyderabad?", `${BRAND.brandName} is based in Hyderabad. Tell us your city on the form so we can advise.`],
  ["Home and business?", "Yes. Residential, commercial and industrial rooftop systems."],
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND.brandName,
    legalName: BRAND.legalName,
    email: BRAND.email,
    telephone: BRAND.phone,
    url: `https://${BRAND.website.replace(/^https?:\/\//, "")}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: BRAND.location,
      addressCountry: "IN",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative min-h-[92vh] overflow-hidden bg-navy-deep text-white">
        <Image
          src="/brand/brochure-1.jpg"
          alt="Rooftop solar"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/92 via-navy-deep/70 to-navy-deep/25" />
        <div className="container-wide relative grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-lime">{BRAND.location} · Rooftop solar</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Go solar on your rooftop.
              <span className="mt-2 block text-lime">Start with a free estimate.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              {BRAND.legalName} designs and installs solar for homes, businesses and industry. Use the form to request a quote — we follow up on WhatsApp or phone.
            </p>
            <p className="mt-6 text-sm text-white/70">
              Estimates are not a guaranteed saving, subsidy or price. Those are confirmed after a site survey.
            </p>
            <a className="mt-8 inline-flex items-center gap-2 text-lg font-bold text-gold" href={telLink(BRAND.phone)}>
              {BRAND.phone}
            </a>
          </div>
          <div id="quote">
            <QuoteWizard />
          </div>
        </div>
      </section>

      <section className="-mt-8 relative z-10 px-4">
        <div className="container-wide grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-navy/5">
              <h2 className="font-display text-xl text-navy">{h.title}</h2>
              <p className="mt-2 text-sm text-muted">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Why solar</p>
            <h2 className="mt-2 font-display text-4xl text-navy">A rooftop solar partner in Hyderabad</h2>
            <p className="mt-5 text-muted">{BRAND.about}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn-outline">
                About {BRAND.brandName}
              </Link>
              <Link href="/solar-calculator" className="btn-primary">
                Full calculator
              </Link>
            </div>
          </div>
          <div className="relative h-80 overflow-hidden rounded-xl">
            <Image src="/brand/brochure-2.jpg" alt="" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white sm:py-20" id="how">
        <div className="container-wide">
          <h2 className="text-center font-display text-3xl sm:text-4xl">Choose solar in 4 easy steps</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/70">{BROCHURE.processSubtitle}</p>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {SIMPLE_PATH.map((s) => (
              <li key={s.n} className="rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="font-display text-4xl text-gold">{s.n}</p>
                <h3 className="mt-3 font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-white/70">{s.plain}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center">
            <Link href="/how-it-works" className="text-sm font-semibold text-lime">
              See the full installation path →
            </Link>
          </p>
        </div>
      </section>

      <HomeCalculator />

      <section className="section" id="rooftop">
        <div className="container-wide">
          <h2 className="text-center font-display text-4xl">Rooftop solar for every roof</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BROCHURE.segments.map((s) => (
              <Link key={s.href} href={s.href} className="card group overflow-hidden">
                <div className="p-6">
                  <h3 className="font-display text-2xl text-navy">{s.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {s.points.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-block text-sm font-bold text-gold">Discover →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-mist" id="why">
        <div className="container-wide">
          <h2 className="text-center font-display text-4xl">Why choose us?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BROCHURE.why.map(([title, text]) => (
              <div key={title} className="rounded-xl bg-white p-6">
                <h3 className="font-display text-lg text-navy">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="section">
        <div className="container-wide">
          <h2 className="font-display text-3xl sm:text-4xl">More solutions</h2>
          <p className="mt-3 max-w-2xl text-muted">EPC, storage, kits and specialised roofs — same team, same Hyderabad base.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {BROCHURE.solutions.map((s) => (
              <Link key={s.href} href={s.href} className="card group overflow-hidden">
                <div className="relative h-36">
                  <Image src={s.image} alt={s.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LeadingBrandsSection brands={[]} />

      <section className="section bg-mist" id="prewired-kits">
        <div className="container-wide">
          <h2 className="max-w-4xl font-display text-3xl sm:text-4xl">Pre-wired solar kits</h2>
          <p className="mt-3 text-muted">Less field wiring. Faster installation. Cleaner work.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {KIT_POINTS.map((p) => (
              <div key={p.title} className="card p-5">
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </div>
            ))}
          </div>
          <Link href="/solar-kits" className="btn-quote mt-8">
            Explore solar kits
          </Link>
        </div>
      </section>

      <section className="section bg-white" id="mounting">
        <div className="container-wide">
          <h2 className="font-display text-3xl sm:text-4xl">Mounted for the long run</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Height and fixings follow roof type and site conditions — not a generic lifespan claim.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STRUCTURES.map((s) => (
              <div key={s.title} className="card overflow-hidden p-0">
                <div className="flex h-28 items-end justify-center bg-navy-deep pb-3">
                  <div
                    className="w-16 rounded-t bg-lime"
                    style={{ height: s.height === "0.5 m" ? "30%" : s.height === "1 m" ? "55%" : "90%" }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.use}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/mounting-structures" className="mt-8 inline-block text-sm font-semibold text-navy">
            Compare 0.5 m, 1 m and 2 m structures →
          </Link>
        </div>
      </section>

      <section className="section bg-mist" id="tin-shed">
        <div className="container-wide">
          <h2 className="font-display text-3xl">Solar for tin sheds</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Adhesive, trapezoidal rails or standing seam — chosen for the actual roof profile.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TIN_SHED.map((t) => (
              <div key={t.title} className="card p-6">
                <h3 className="font-display text-xl">{t.title}</h3>
                <p className="mt-3 text-sm text-muted">{t.text}</p>
              </div>
            ))}
          </div>
          <Link href="/tin-shed-solar" className="btn-outline mt-8">
            Metal roof options
          </Link>
        </div>
      </section>

      <section className="section bg-navy text-white" id="cleaning">
        <div className="container-wide">
          <h2 className="font-display text-3xl sm:text-4xl">Clean panels. More sunlight.</h2>
          <p className="mt-4 max-w-2xl text-white/75">
            Dust and deposits reduce generation. We can schedule cleaning or maintenance when you ask.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CLEANING.map((c) => (
              <div key={c.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-lg text-lime">{c.title}</h3>
                <p className="mt-2 text-sm text-white/70">{c.text}</p>
              </div>
            ))}
          </div>
          <Link href="/book-consultation?intent=maintenance" className="btn-quote mt-10">
            Request maintenance
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container-wide max-w-3xl">
          <h2 className="font-display text-3xl">Questions</h2>
          <div className="mt-8 divide-y divide-navy/10 rounded-xl border border-navy/10">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-3 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gold py-16 text-navy-deep">
        <div className="container-wide text-center">
          <h2 className="font-display text-4xl">Ready to see what solar can save you?</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy/80">Request a quote or run the calculator. We will not invent a saving figure for you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#quote" className="rounded-md bg-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white">
              Get a Quote!
            </Link>
            <Link href="/solar-calculator" className="btn-primary">
              Calculate savings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
