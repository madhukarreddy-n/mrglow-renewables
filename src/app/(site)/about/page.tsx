import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { BROCHURE } from "@/content/brochure";
import { PageHero, FourSteps, GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = { title: "About Us" };

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow={`About ${BRAND.brandName}`}
        headline={BRAND.legalName}
        support={BRAND.about}
        image="/brand/brochure-2.jpg"
      />
      <section className="section">
        <div className="container-wide grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">Our mission</h2>
            <p className="mt-3 text-muted">{BRAND.mission}</p>
            <h2 className="mt-10 font-display text-2xl">Our vision</h2>
            <p className="mt-3 text-muted">{BRAND.vision}</p>
            <h2 className="mt-10 font-display text-2xl">Core values</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {BROCHURE.values.map(([t, d]) => (
                <li key={t} className="rounded-xl bg-mist p-4">
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl bg-white p-4 ring-1 ring-navy/10">
            <Image src="/brand/logo-lockup.jpg" alt={BRAND.legalName} width={400} height={500} className="h-auto w-full" />
            <p className="mt-4 text-sm text-muted">{BRAND.location} · {BRAND.phone} · {BRAND.email}</p>
            <Link href="/why-mrglow" className="btn-outline mt-6 inline-flex">
              Why Mr.GLOW
            </Link>
          </div>
        </div>
      </section>
      <FourSteps />
      <GoldCta />
    </article>
  );
}
