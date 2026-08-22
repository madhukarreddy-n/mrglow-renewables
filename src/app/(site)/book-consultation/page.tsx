import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ConsultationForm } from "@/components/site/consultation-form";

export const metadata: Metadata = { title: "Book Free Consultation" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const s = await getSettings();
  const maintenance = intent === "maintenance";
  return (
    <article className="section">
      <div className="container-wide grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-lime">
            {maintenance ? "Cleaning & maintenance" : "Consultation"}
          </p>
          <h1 className="mt-3 font-display text-4xl text-navy">
            {maintenance ? "Schedule cleaning / request maintenance" : "Book a free consultation"}
          </h1>
          <p className="mt-4 text-muted">
            {s.location}. {s.phone} · {s.email}
          </p>
        </div>
        <div className="card p-8">
          <ConsultationForm intent={intent} />
        </div>
      </div>
    </article>
  );
}
