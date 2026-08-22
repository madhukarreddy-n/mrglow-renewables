import Link from "next/link";
import Image from "next/image";

const BOLT =
  "M17.6 3.2 12.1 15.1h4.5L13.2 29.2 23.6 13.6h-4.7L17.6 3.2z";

/** Font O with the bolt cutting through the ring, as in the lockup. */
export function GlowO() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="inline-block h-[1.05em] w-[1.05em] overflow-visible align-baseline"
      aria-hidden
    >
      <defs>
        <mask id="glow-o-cut" maskUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="white" />
          <g transform="rotate(48 16 16)">
            <path d={BOLT} fill="black" stroke="black" strokeLinejoin="round" strokeWidth="2.4" />
          </g>
        </mask>
      </defs>
      <text
        x="16"
        y="26"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="DM Sans, ui-sans-serif, system-ui, sans-serif"
        fontSize="32"
        fontWeight="800"
        mask="url(#glow-o-cut)"
      >
        O
      </text>
      <g transform="rotate(48 16 16)">
        <path d={BOLT} fill="#F5A623" />
      </g>
    </svg>
  );
}

/** Mr. + GLOW (one colour) with energy O */
export function BrandWordmark({
  light = false,
  showLegal = true,
}: {
  light?: boolean;
  showLegal?: boolean;
}) {
  return (
    <span className="leading-none">
      <span className={`flex items-center font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        <span className="text-[15px] sm:text-[17px]">Mr.</span>
        <span className="flex items-end text-[15px] font-extrabold leading-none text-lime sm:text-[17px]">
          GL
          <GlowO />
          W
        </span>
      </span>
      {showLegal ? (
        <span
          className={`mt-1 block text-[8px] font-semibold uppercase tracking-[0.12em] sm:text-[9px] ${
            light ? "text-white/70" : "text-muted"
          }`}
        >
          RENEWABLES PVT LTD
        </span>
      ) : (
        <span
          className={`mt-1 block text-[8px] font-semibold uppercase tracking-[0.14em] sm:text-[9px] ${
            light ? "text-white/70" : "text-muted"
          }`}
        >
          RENEWABLES
        </span>
      )}
    </span>
  );
}

export function Logo({
  light = false,
  variant = "header",
}: {
  light?: boolean;
  variant?: "header" | "lockup";
}) {
  if (variant === "lockup") {
    return (
      <Link href="/" className="inline-block overflow-hidden rounded-2xl bg-white p-2" aria-label="Mr.GLOW RENEWABLES PVT LTD">
        <Image
          src="/brand/logo-lockup.jpg"
          alt="Mr.GLOW RENEWABLES PVT LTD — Powering a Greener Tomorrow"
          width={280}
          height={340}
          className="h-36 w-auto sm:h-44"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Mr.GLOW RENEWABLES PVT LTD">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-lime/80">
        <Image
          src="/brand/logo-lockup.jpg"
          alt=""
          fill
          className="object-cover object-[50%_12%]"
          sizes="48px"
          priority
        />
      </span>
      <BrandWordmark light={light} showLegal />
    </Link>
  );
}

export const NAV = [
  {
    label: "Solutions",
    href: "/#solutions",
    children: [
      { href: "/residential-solar", label: "Residential Solar" },
      { href: "/commercial-solar", label: "Commercial Solar" },
      { href: "/industrial-solar", label: "Industrial Solar" },
      { href: "/solar-epc", label: "Solar EPC" },
      { href: "/bess", label: "BESS" },
      { href: "/on-grid-solar", label: "On-Grid Solar" },
      { href: "/hybrid-solar", label: "Hybrid Solar" },
      { href: "/off-grid-solar", label: "Off-Grid Solar" },
      { href: "/solar-kits", label: "Solar Kits" },
      { href: "/mounting-structures", label: "Mounting Structures" },
      { href: "/tin-shed-solar", label: "Tin Shed / Metal Roof" },
      { href: "/solar-cleaning", label: "Cleaning & Maintenance" },
      { href: "/brands", label: "Leading Brands" },
      { href: "/solar-water-pumps", label: "Solar Water Pumps" },
      { href: "/gated-communities", label: "Gated Communities" },
      { href: "/ground-mounted-solar", label: "Ground Mounted Solar" },
    ],
  },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-mrglow", label: "Why Mr.GLOW" },
  { href: "/solar-calculator", label: "Solar Calculator" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function WhatsAppIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} aria-hidden>
      <path
        fill="currentColor"
        d="M20.5 3.5A11 11 0 0 0 2.1 17.7L1 23l5.4-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 18a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.2.7.7-3.1-.2-.3A9.1 9.1 0 1 1 12 21.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.1-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.5-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4.1 15.6 15.6 0 0 0 1.6.6 3.8 3.8 0 0 0 1.8.1 2.9 2.9 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z"
      />
    </svg>
  );
}
