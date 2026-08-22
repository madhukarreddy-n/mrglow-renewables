import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { telLink, whatsappLink } from "@/lib/utils";
import { ConsultationForm } from "@/components/site/consultation-form";

export const metadata: Metadata = { title: "Contact" };

export default async function Page() {
  const s = await getSettings();
  return (
    <section className="section">
      <div className="container-wide grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{s.brandName}</h1>
          <p className="mt-4 text-muted">{s.location}</p>
          <ul className="mt-6 space-y-2">
            <li><a className="font-semibold" href={telLink(s.phone)}>{s.phone}</a></li>
            <li><a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li>{s.website}</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn-primary" href={whatsappLink(s.whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}>WhatsApp</a>
            <a className="btn-outline" href={telLink(s.phone)}>Call</a>
            <Link className="btn-outline" href="/book-consultation">Book consultation</Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-2xl">Send a message</h2>
          <ConsultationForm compact />
        </div>
      </div>
    </section>
  );
}
