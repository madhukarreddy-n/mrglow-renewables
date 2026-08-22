import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Terms of Use" };

export default async function Page() {
  const s = await getSettings();
  return (
    <article className="section">
      <div className="container-wide max-w-3xl whitespace-pre-wrap text-muted">
        <h1 className="font-display text-4xl text-navy">Terms of Use</h1>
        <p className="mt-8">{s.terms}</p>
      </div>
    </article>
  );
}
