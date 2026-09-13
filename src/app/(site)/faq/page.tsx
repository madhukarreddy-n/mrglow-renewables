import type { Metadata } from "next";
import { FaqBlock, GoldCta, PageHero, SITE_FAQS } from "@/components/site/page-chrome";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about rooftop solar, sizing, subsidy and how Mr.GLOW RENEWABLES works with you.",
};

export default function Page() {
  return (
    <article>
      <PageHero
        eyebrow="FAQs"
        headline="Questions, answered simply"
        support="If you need a figure for your roof, use the calculator or the quote form. We will not invent a saving percentage for you."
      />
      <FaqBlock items={SITE_FAQS} />
      <GoldCta />
    </article>
  );
}
