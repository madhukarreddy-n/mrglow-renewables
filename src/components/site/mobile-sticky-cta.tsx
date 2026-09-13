"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./logo";

export function MobileStickyCta({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-px bg-white p-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:hidden">
      <a className="flex flex-col items-center gap-1 rounded-md bg-mist py-2 text-[11px] font-semibold text-navy" href={telLink(phone)}>
        <Phone className="h-4 w-4" /> Call
      </a>
      <a
        className="flex flex-col items-center gap-1 rounded-md bg-mist py-2 text-[11px] font-semibold text-navy"
        href={whatsappLink(whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}
      >
        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
      </a>
      <Link className="flex flex-col items-center justify-center rounded-md bg-gold py-2 text-[11px] font-bold uppercase text-navy" href="/#quote">
        Get a Quote
      </Link>
    </div>
  );
}
