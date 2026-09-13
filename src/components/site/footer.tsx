import Link from "next/link";
import { CompanySettings } from "@/lib/brand";
import { Logo } from "./logo";
import { telLink, whatsappLink } from "@/lib/utils";

export function SiteFooter({ settings }: { settings: CompanySettings }) {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-wide grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo variant="lockup" />
          <p className="mt-4 max-w-md text-sm text-white/70">
            {settings.legalName} — rooftop solar for homes, businesses and industry. {settings.location}.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-lime">{settings.tagline}</p>
          <Link href="/#quote" className="btn-quote mt-6 inline-flex">
            Get a Quote!
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Rooftop solar</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/residential-solar">Residential</Link></li>
            <li><Link href="/commercial-solar">Commercial</Link></li>
            <li><Link href="/industrial-solar">Industrial</Link></li>
            <li><Link href="/gated-communities">Housing societies</Link></li>
            <li><Link href="/solar-calculator">Solar calculator</Link></li>
            <li><Link href="/solar-subsidy">Solar subsidy</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Solutions</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/on-grid-solar">On-grid</Link></li>
            <li><Link href="/hybrid-solar">Hybrid</Link></li>
            <li><Link href="/off-grid-solar">Off-grid</Link></li>
            <li><Link href="/bess">BESS</Link></li>
            <li><Link href="/solar-epc">Solar EPC</Link></li>
            <li><Link href="/solar-kits">Kits</Link></li>
            <li><Link href="/solar-cleaning">Cleaning</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Company</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/why-mrglow">Why Mr.GLOW</Link></li>
            <li><Link href="/how-it-works">How it works</Link></li>
            <li><Link href="/faq">FAQs</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>{settings.location}</li>
            <li><a href={telLink(settings.phone)}>{settings.phone}</a></li>
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            <li>
              <a href={whatsappLink(settings.whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}>WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        <p>{settings.legalName}</p>
        <p className="mt-2 space-x-4">
          <Link href="/terms">Terms of Use</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}
