import type { Metadata } from "next";
import { SolutionPage, solutionMetadata } from "@/components/site/solution-page";
import { BRAND_CATEGORIES, BRAND_PILLARS } from "@/content/offerings";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = solutionMetadata(
  "Leading Solar Brands",
  "Quality, reliability, performance, warranty and service support in the components Mr.GLOW RENEWABLES specifies.",
);

export default async function Page() {
  let brands: { id: string; name: string; category: string; highlight: string | null }[] = [];
  try {
    if (isDatabaseConfigured()) {
      brands = await prisma.showcaseBrand.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      });
    }
  } catch {
    brands = [];
  }
  return (
    <SolutionPage
      title="Leading brands"
      headline="Leading Brands. Reliable Solar."
      intro="We don't compromise on the components that power your solar investment. Named OEM logos appear here only when Mr.GLOW RENEWABLES publishes the brands actually used on projects."
      points={BRAND_PILLARS.map((p) => `${p.title}: ${p.text}`)}
      benefits={BRAND_CATEGORIES.map((c) => `${c.name} — ${c.role}`)}
      cta={{ href: "/book-consultation", label: "Talk to a Solar Expert" }}
      secondary={{ href: "/solar-calculator", label: "Calculate Solar Savings" }}
      extra={
        brands.length > 0 ? (
          <div className="container-wide mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((b) => (
              <div key={b.id} className="card p-6">
                <p className="text-xs uppercase text-muted">{b.category}</p>
                <h3 className="mt-2 font-display text-xl">{b.name}</h3>
                {b.highlight ? <p className="mt-2 text-sm text-muted">{b.highlight}</p> : null}
              </div>
            ))}
          </div>
        ) : null
      }
    />
  );
}
