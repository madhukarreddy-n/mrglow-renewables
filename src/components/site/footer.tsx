import Link from "next/link";
import { CompanySettings } from "@/lib/settings";
import { Logo } from "./logo";
import { telLink, whatsappLink } from "@/lib/utils";

export function SiteFooter({ settings }: { settings: CompanySettings }) {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-wide grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo variant="lockup" />
          <p className="mt-4 max-w-md text-sm text-white/70">
            From your first solar calculation to years of savings, {settings.brandName} is your
            end-to-end solar partner.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-lime">{settings.tagline}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/solar-calculator">Solar Calculator</Link></li>
            <li><Link href="/book-consultation">Book Consultation</Link></li>
            <li><Link href="/brands">Leading Brands</Link></li>
            <li><Link href="/solar-kits">Solar Kits</Link></li>
            <li><Link href="/mounting-structures">Mounting Structures</Link></li>
            <li><Link href="/tin-shed-solar">Tin Shed Solar</Link></li>
            <li><Link href="/solar-cleaning">Cleaning & Maintenance</Link></li>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>{settings.location}</li>
            <li><a href={telLink(settings.phone)}>{settings.phone}</a></li>
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            <li>{settings.website}</li>
            <li>
              <a href={whatsappLink(settings.whatsapp, "Hello Mr.GLOW, I would like to discuss solar.")}>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        <p>
          {settings.legalName}
        </p>
        <p className="mt-2 space-x-4">
          <Link href="/terms">Terms of Use</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}
