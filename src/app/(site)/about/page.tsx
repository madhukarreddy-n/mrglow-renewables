import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { BROCHURE } from "@/content/brochure";

export const metadata: Metadata = { title: "About Us" };

export default async function Page() {
  const s = await getSettings();
  return (
    <article>
      <section className="relative overflow-hidden bg-navy-deep py-20 text-white">
        <Image src="/brand/brochure-2.jpg" alt="" fill className="object-cover opacity-30" />
        <div className="container-wide relative">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">About {s.brandName}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">{s.legalName}</h1>
          <div className="mt-8 overflow-hidden rounded-3xl bg-white p-4 sm:max-w-xs">
            <Image
              src="/brand/logo-lockup.jpg"
              alt={s.legalName}
              width={320}
              height={400}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-wide max-w-3xl">
          <h2 className="font-display text-2xl">Who we are</h2>
          <p className="mt-4 text-lg text-muted">{s.about}</p>
          <h2 className="mt-12 font-display text-2xl">Our mission</h2>
          <p className="mt-3 text-muted">{s.mission}</p>
          <h2 className="mt-12 font-display text-2xl">Our vision</h2>
          <p className="mt-3 text-muted">{s.vision}</p>
          <h2 className="mt-12 font-display text-2xl">Our core values</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {BROCHURE.values.map(([t, d]) => (
              <li key={t} className="rounded-2xl bg-mist p-4">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/solar-calculator" className="btn-primary">Calculate My Solar Savings</Link>
            <Link href="/book-consultation" className="btn-outline">Book Free Consultation</Link>
          </div>
        </div>
      </section>
    </article>
  );
}
