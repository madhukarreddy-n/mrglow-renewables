import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Thank you" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <section className="section">
      <div className="container-wide max-w-xl text-center">
        <h1 className="font-display text-4xl">Thank You!</h1>
        <p className="mt-4 text-muted">Your solar consultation request has been received.</p>
        {ref ? <p className="mt-6 rounded-2xl bg-mist p-4 font-semibold text-sm break-all">Reference: {ref}</p> : null}
        <p className="mt-4 text-sm text-muted">Our team will contact you using the details provided.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className="btn-primary" href={whatsappLink(BRAND.whatsapp, `Hello Mr.GLOW, my reference is ${ref || ""}.`)}>
            WhatsApp Mr.GLOW
          </a>
          <Link className="btn-outline" href="/">
            Return to Website
          </Link>
          <a className="btn-outline" href={telLink(BRAND.phone)}>
            Call {BRAND.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
