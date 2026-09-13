import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { PageHero, FourSteps, GoldCta } from "@/components/site/page-chrome";
import { ConsultationForm } from "@/components/site/consultation-form";

export const metadata: Metadata = { title: "Book Free Consultation" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const maintenance = intent === "maintenance";
  return (
    <article>
      <PageHero
        eyebrow={maintenance ? "Cleaning & maintenance" : "Consultation"}
        headline={maintenance ? "Schedule cleaning or request maintenance" : "Book a free consultation"}
        support={`${BRAND.location}. ${BRAND.phone} · ${BRAND.email}`}
        image="/brand/brochure-6.jpg"
      />
      <section className="section">
        <div className="container-wide max-w-xl">
          <div className="card p-8">
            <ConsultationForm intent={intent} />
          </div>
        </div>
      </section>
      <FourSteps />
      <GoldCta />
    </article>
  );
}
