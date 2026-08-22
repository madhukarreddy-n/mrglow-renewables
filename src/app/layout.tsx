import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: `${s.brandName} | Solar solutions in Hyderabad`,
      template: `%s | ${s.brandName}`,
    },
    description: s.heroSupport,
    openGraph: {
      title: s.heroHeadline,
      description: s.heroSupport,
      locale: "en_IN",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
