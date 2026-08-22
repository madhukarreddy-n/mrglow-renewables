"use client";

import Link from "next/link";
import { Phone, Calculator } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./logo";

export function MobileStickyCta({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-px bg-navy-deep p-2 md:hidden">
      <a className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-2 text-[11px] text-white" href={telLink(phone)}>
        <Phone className="h-4 w-4" /> Call
      </a>
      <a
        className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-2 text-[11px] text-white"
        href={whatsappLink(whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}
      >
        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
      </a>
      <Link className="flex flex-col items-center gap-1 rounded-2xl bg-lime py-2 text-[11px] font-semibold text-navy" href="/solar-calculator">
        <Calculator className="h-4 w-4" /> Calculate
      </Link>
    </div>
  );
}
