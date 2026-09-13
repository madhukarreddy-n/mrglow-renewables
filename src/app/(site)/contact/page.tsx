import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { telLink, whatsappLink } from "@/lib/utils";
import { PageHero, GoldCta } from "@/components/site/page-chrome";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="Contact"
        headline={`Talk to ${BRAND.brandName}`}
        support={`${BRAND.location}. Call, WhatsApp, or send the quote form — a specialist will follow up.`}
        image="/brand/brochure-5.jpg"
      />
      <section className="section">
        <div className="container-wide max-w-2xl">
          <div>
            <h2 className="font-display text-3xl">{BRAND.legalName}</h2>
            <ul className="mt-6 space-y-2 text-lg">
              <li>
                <a className="font-bold text-navy" href={telLink(BRAND.phone)}>
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </li>
              <li>{BRAND.website}</li>
              <li>{BRAND.location}</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn-quote" href={whatsappLink(BRAND.whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}>
                WhatsApp
              </a>
              <a className="btn-outline" href={telLink(BRAND.phone)}>
                Call
              </a>
              <Link className="btn-outline" href="/book-consultation">
                Full consultation form
              </Link>
            </div>
          </div>
        </div>
      </section>
      <GoldCta title="Prefer to start with numbers?" />
    </article>
  );
}
