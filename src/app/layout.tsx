import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.mrglowrenewables.in"),
  title: {
    default: `${BRAND.brandName} | Solar solutions in Hyderabad`,
    template: `%s | ${BRAND.brandName}`,
  },
  description: BRAND.heroSupport,
  openGraph: {
    title: BRAND.heroHeadline,
    description: BRAND.heroSupport,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
