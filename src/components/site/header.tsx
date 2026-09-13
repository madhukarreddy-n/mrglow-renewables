"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { CompanySettings } from "@/lib/brand";
import { Logo, NAV } from "./logo";
import { telLink } from "@/lib/utils";

export function SiteHeader({ settings }: { settings: CompanySettings }) {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white text-navy shadow-sm">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div key={item.label} className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-navy/80 hover:text-navy"
                  onClick={() => setDropdown((v) => (v === item.label ? null : item.label))}
                  aria-expanded={dropdown === item.label}
                >
                  {item.label} <ChevronDown className="h-4 w-4" />
                </button>
                {dropdown === item.label ? (
                  <div className="absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-72 overflow-y-auto rounded-xl bg-white p-3 shadow-xl ring-1 ring-navy/10">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-mist"
                        onClick={() => setDropdown(null)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link key={item.href} href={item.href!} className="text-sm font-medium text-navy/80 hover:text-navy">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <a className="flex items-center gap-2 text-sm font-bold text-navy" href={telLink(settings.phone)}>
            <Phone className="h-4 w-4 text-gold" />
            {settings.phone}
          </a>
          <Link href="/#quote" className="btn-quote !py-2.5 text-xs">
            Get a Quote!
          </Link>
        </div>
        <button
          className="rounded-md p-2 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-navy/10 bg-white px-4 py-6 lg:hidden">
          {NAV.flatMap((item) =>
            item.children ? item.children : [{ href: item.href!, label: item.label }],
          ).map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-navy" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a className="mt-4 block font-bold" href={telLink(settings.phone)}>
            {settings.phone}
          </a>
          <Link href="/#quote" className="btn-quote mt-4 w-full" onClick={() => setOpen(false)}>
            Get a Quote!
          </Link>
        </div>
      ) : null}
    </header>
  );
}
