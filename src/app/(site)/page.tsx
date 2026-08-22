import Link from "next/link";
import Image from "next/image";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CalculatorTeaser } from "@/components/site/calculator-teaser";
import { SimplePath } from "@/components/site/journey-path";
import { formatInr } from "@/lib/utils";
import { BROCHURE } from "@/content/brochure";
import { LeadingBrandsSection } from "@/components/site/leading-brands";
import { KIT_POINTS, STRUCTURES, TIN_SHED, CLEANING } from "@/content/offerings";

const QUALITY = [
  ["Neat Cable Management", "Cables routed in trays rather than left loose across the roof."],
  ["Professional Earthing", "Earthing designed as part of electrical safety, not an afterthought."],
  ["Safe Electrical Protection", "ACDB, DCDB and surge protection specified with the system."],
  ["Engineered Mounting", "Structures designed for the roof or ground conditions of the site."],
  ["Built for Long-Term Performance", "Waterproofing, alignment and inverter placement considered together."],
];

export default async function HomePage() {
  const settings = await getSettings();
  let faqs: { id: string; question: string; answer: string }[] = [];
  let testimonials: { id: string; customerName: string; quote: string; location?: string | null; systemCapacity?: string | null }[] = [];
  let projects: { id: string; name: string; location: string | null; capacityKwp: unknown; category: string }[] = [];
  let brands: { id: string; name: string; category: string; highlight: string | null }[] = [];
  try {
    if (isDatabaseConfigured()) {
      faqs = await prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
      testimonials = await prisma.testimonial.findMany({ where: { approved: true }, take: 6 });
      projects = await prisma.project.findMany({ where: { published: true, isDemo: false }, take: 6 });
      brands = await prisma.showcaseBrand.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
    }
  } catch {
    faqs = [];
  }

  let components: { name: string; text: string }[] = [];
  try {
    if (isDatabaseConfigured()) {
      const block = await prisma.contentBlock.findUnique({ where: { slug: "components" } });
      components = (block?.body as { name: string; text: string }[]) ?? [];
    }
  } catch {
    components = [];
  }

  const stats = settings.publishStatistics
    ? [
        [settings.statistics.installations, "Solar Installations"],
        [settings.statistics.kwpInstalled, "kWp Installed"],
        [settings.statistics.customerSavings, "Estimated Customer Savings"],
        [settings.statistics.homesBusinesses, "Homes & Businesses"],
        [settings.statistics.yearsExperience, "Years Experience"],
      ].filter(([v]) => Boolean(v))
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.brandName,
    legalName: settings.legalName,
    email: settings.email,
    telephone: settings.phone,
    url: `https://${settings.website.replace(/^https?:\/\//, "")}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.location,
      addressCountry: "IN",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <Image
          src="/brand/brochure-1.jpg"
          alt="Mr.GLOW RENEWABLES solar installations"
          fill
          className="object-cover object-top opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/40 via-navy-deep/70 to-navy-deep" />
        <div className="container-wide relative grid gap-12 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-lime">{settings.tagline}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight sm:text-6xl">
              Powering
              <span className="mt-1 block text-lime">a Greener Tomorrow</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">{settings.heroSupport}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/solar-calculator" className="btn-primary">
                Calculate My Solar Savings
              </Link>
              <Link href="/book-consultation" className="btn-secondary">
                Book Free Consultation
              </Link>
            </div>
          </div>
          <div className="card bg-white/95 p-6 text-navy">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">The simple path</p>
            <p className="mt-2 font-display text-xl">Four steps. That’s the whole process.</p>
            <ol className="mt-5">
              {[
                ["Calculate", "See estimated savings from your bill"],
                ["Consult", "Talk to Mr.GLOW — free"],
                ["Design", "Survey and a clear proposal"],
                ["Save", "Install, monitor, maintain"],
              ].map(([title, text], i, arr) => (
                <li key={title} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < arr.length - 1 && (
                    <span className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-lime/70" aria-hidden />
                  )}
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-xs text-lime">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CalculatorTeaser />

      {stats.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <h2 className="font-display text-3xl">Solar by the Numbers</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map(([value, label]) => (
                <div key={label} className="card p-6">
                  <p className="font-display text-3xl text-navy">{value}</p>
                  <p className="mt-2 text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section bg-navy text-white">
        <div className="container-wide">
          <h2 className="text-center font-display text-2xl uppercase tracking-[0.12em]">What we stand for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BROCHURE.pillars.map((p) => (
              <div key={p.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <h3 className="font-display text-lg text-lime">{p.title}</h3>
                <p className="mt-2 text-sm text-white/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="section">
        <div className="container-wide">
          <h2 className="font-display text-3xl sm:text-4xl">Our Solutions</h2>
          <p className="mt-3 max-w-2xl text-muted">Complete solar & energy solutions from Mr.GLOW RENEWABLES.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {BROCHURE.solutions.map((s) => (
              <Link key={s.href} href={s.href} className="card group overflow-hidden">
                <div className="relative h-40">
                  <Image src={s.image} alt={s.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.text}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-lime">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BROCHURE.segments.map((s) => (
              <Link key={s.href} href={s.href} className="rounded-3xl border border-navy/10 bg-white p-6">
                <h3 className="font-display text-xl">{s.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {s.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-wide">
          <h2 className="font-display text-3xl">Why Choose Mr.GLOW?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BROCHURE.why.map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-navy/8 bg-sand p-6">
                <h3 className="font-display text-lg">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy text-white">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">How it works</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl sm:text-4xl">Our end-to-end process</h2>
          <p className="mt-4 max-w-2xl text-white/75">{BROCHURE.processSubtitle}</p>
          <div className="mt-12">
            <SimplePath dark />
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/solar-calculator" className="btn-primary">
              Start with step 1 — calculate
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              See the full path
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <h2 className="max-w-3xl font-display text-3xl">
            Professional installation — more than panels on a roof
          </h2>
          <div className="relative mt-8 h-56 overflow-hidden rounded-3xl">
            <Image src="/brand/brochure-4.jpg" alt="Mr.GLOW RENEWABLES end-to-end solar process" fill className="object-cover object-top" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {QUALITY.map(([title, text]) => (
              <div key={title} className="card p-6">
                <h3 className="font-display text-lg">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">
            Project photography can be added from Admin when Mr.GLOW installation photos are available. Imagery on this page is generic until then.
          </p>
        </div>
      </section>

      <LeadingBrandsSection brands={brands} />

      <section className="section bg-mist" id="prewired-kits">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">Solar kits</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl sm:text-4xl">
            Pre-Wired Solar Kits – Less Wiring. Faster Installation. Fewer Hassles.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {KIT_POINTS.map((p) => (
              <div key={p.title} className="card p-5">
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </div>
            ))}
          </div>
          <Link href="/solar-kits" className="btn-primary mt-8">
            Explore solar kits
          </Link>
        </div>
      </section>

      <section className="section bg-white" id="mounting">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Structures</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Built to Last. Mounted for the Long Run.</h2>
          <p className="mt-4 max-w-2xl text-muted">
            The mounting structure is critical for long-term solar reliability. Height and fixings should follow roof type and site conditions — not a generic lifespan claim.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STRUCTURES.map((s) => (
              <div key={s.title} className="card overflow-hidden p-0">
                <div className="flex h-32 items-end justify-center bg-navy-deep pb-3">
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
          <Link href="/mounting-structures" className="mt-8 inline-block text-sm font-semibold">
            Compare 0.5 m, 1 m and 2 m structures →
          </Link>
        </div>
      </section>

      <section className="section" id="tin-shed">
        <div className="container-wide">
          <h2 className="font-display text-3xl sm:text-4xl">Solar for Tin Sheds – Without Unnecessary Roof Puncturing.</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Three approaches: adhesive technology, trapezoidal rails and standing seam rails. The final solution depends on the actual roof profile and structural/site conditions.
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
          <h2 className="font-display text-3xl sm:text-4xl">Clean Panels. More Sunlight. Better Generation.</h2>
          <p className="mt-4 max-w-2xl text-white/75">
            Dust, dirt, bird droppings and other deposits can reduce sunlight reaching the panels and affect generation.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CLEANING.map((c) => (
              <div key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-lg text-lime">{c.title}</h3>
                <p className="mt-2 text-sm text-white/70">{c.text}</p>
              </div>
            ))}
          </div>
          <Link href="/book-consultation?intent=maintenance" className="btn-primary mt-10">
            Schedule Cleaning / Request Maintenance
          </Link>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-wide">
          <h2 className="font-display text-3xl">What Goes Into Your Solar System?</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {components.map((c) => (
              <div key={c.name} className="rounded-3xl border border-navy/8 p-6">
                <h3 className="font-display text-lg">{c.name}</h3>
                <p className="mt-2 text-sm text-muted">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">See the financial picture before you commit</h2>
            <p className="mt-4 text-muted">
              The calculator estimates system size, generation, investment, estimated subsidy, payback and lifetime savings from your bill or units.
            </p>
            <Link href="/solar-calculator" className="btn-primary mt-6">
              Calculate My Solar Savings
            </Link>
          </div>
          <div className="card grid grid-cols-2 gap-4 p-8">
            <div>
              <p className="text-xs text-muted">Example only</p>
              <p className="font-display text-3xl">4.18 kWp</p>
              <p className="text-sm">Estimated system</p>
            </div>
            <div>
              <p className="text-xs text-muted">Example only</p>
              <p className="font-display text-3xl">{formatInr(23147, true)}</p>
              <p className="text-sm">Estimated annual savings</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl">Projects</h2>
            <Link href="/projects" className="text-sm font-semibold">View all</Link>
          </div>
          {projects.length === 0 ? (
            <p className="mt-8 rounded-3xl border border-dashed border-navy/15 p-10 text-muted">
              Project case studies will appear here once they are published from Admin. No sample installations are shown on the public website.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="card p-6">
                  <p className="text-xs uppercase text-muted">{p.category}</p>
                  <h3 className="mt-2 font-display text-xl">{p.name}</h3>
                  <p className="text-sm text-muted">{p.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <h2 className="font-display text-3xl">What customers say</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="card p-6">
                  <p className="text-sm">“{t.quote}”</p>
                  <footer className="mt-4 text-sm font-semibold">
                    {t.customerName}
                    {t.location ? ` · ${t.location}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-wide">
          <h2 className="font-display text-3xl">Questions, answered simply</h2>
          <div className="mt-8 divide-y divide-navy/10 rounded-3xl bg-white">
            {faqs.map((f) => (
              <details key={f.id} className="group p-6">
                <summary className="cursor-pointer font-semibold">{f.question}</summary>
                <p className="mt-3 text-sm text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy text-white">
        <div className="container-wide text-center">
          <h2 className="font-display text-4xl">Ready to See What Solar Can Save You?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/solar-calculator" className="btn-primary">Calculate My Solar Savings</Link>
            <Link href="/book-consultation" className="btn-secondary">Book Free Consultation</Link>
            <Link href="/contact" className="btn-secondary">WhatsApp an Expert</Link>
          </div>
        </div>
      </section>
    </>
  );
}
