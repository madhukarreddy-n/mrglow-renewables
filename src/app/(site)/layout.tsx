import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MobileStickyCta } from "@/components/site/mobile-sticky-cta";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader settings={settings} />
      <main className="pb-20 md:pb-0">{children}</main>
      <SiteFooter settings={settings} />
      <MobileStickyCta phone={settings.phone} whatsapp={settings.whatsapp} />
      <Link href="/admin/login" className="sr-only">
        Staff login
      </Link>
    </>
  );
}
