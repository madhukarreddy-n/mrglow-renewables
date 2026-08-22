import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Thank you" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const s = await getSettings();
  return (
    <section className="section">
      <div className="container-wide max-w-xl text-center">
        <h1 className="font-display text-4xl">Thank You!</h1>
        <p className="mt-4 text-muted">Your solar consultation request has been received.</p>
        {ref ? (
          <p className="mt-6 rounded-2xl bg-mist p-4 font-semibold">
            Lead Reference: {ref}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted">Our team will contact you using the details provided.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className="btn-primary" href={whatsappLink(s.whatsapp, `Hello Mr.GLOW, my reference is ${ref || ""}.`)}>
            WhatsApp Mr.GLOW
          </a>
          <Link className="btn-outline" href="/">Return to Website</Link>
          <a className="btn-outline" href={telLink(s.phone)}>Call {s.phone}</a>
        </div>
      </div>
    </section>
  );
}
