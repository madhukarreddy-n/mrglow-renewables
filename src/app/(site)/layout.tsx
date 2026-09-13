import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MobileStickyCta } from "@/components/site/mobile-sticky-cta";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader settings={BRAND} />
      <main className="pb-20 md:pb-0">{children}</main>
      <SiteFooter settings={BRAND} />
      <MobileStickyCta phone={BRAND.phone} whatsapp={BRAND.whatsapp} />
      <Link href="/admin/login" className="sr-only">
        Staff login
      </Link>
    </>
  );
}
