"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { CompanySettings } from "@/lib/settings";
import { Logo, NAV } from "./logo";

export function SiteHeader({ settings }: { settings: CompanySettings }) {
  const [open, setOpen] = useState(false);
  const [solutions, setSolutions] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-deep/95 text-white backdrop-blur-xl">
      <div className="container-wide flex h-18 items-center justify-between py-3">
        <Logo light />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div key={item.label} className="relative">
                <button
                  className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
                  onClick={() => setSolutions((v) => !v)}
                  aria-expanded={solutions}
                >
                  {item.label} <ChevronDown className="h-4 w-4" />
                </button>
                {solutions && (
                  <div className="absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-72 overflow-y-auto rounded-2xl bg-white p-3 text-navy shadow-xl">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-mist"
                        onClick={() => setSolutions(false)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.href} href={item.href!} className="text-sm text-white/80 hover:text-white">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/book-consultation" className="btn-secondary !py-2.5 text-xs">
            Book Consultation
          </Link>
          <Link href="/solar-calculator" className="btn-primary !py-2.5">
            Calculate Savings
          </Link>
        </div>
        <div className="hidden lg:block xl:hidden">
          <Link href="/solar-calculator" className="btn-primary">
            Calculate Savings
          </Link>
        </div>
        <button
          className="rounded-full p-2 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-navy-deep px-4 py-6 lg:hidden">
          {NAV.flatMap((item) =>
            item.children
              ? item.children
              : [{ href: item.href!, label: item.label }],
          ).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-white/90"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/solar-calculator" className="btn-primary mt-4 w-full" onClick={() => setOpen(false)}>
            Calculate Savings
          </Link>
          <Link href="/book-consultation" className="btn-secondary mt-2 w-full text-center" onClick={() => setOpen(false)}>
            Book Consultation
          </Link>
          <p className="mt-3 text-xs text-white/50">{settings.location}</p>
        </div>
      )}
    </header>
  );
}
