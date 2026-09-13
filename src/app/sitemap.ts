import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.mrglowrenewables.in";
  const paths = [
    "",
    "/residential-solar",
    "/commercial-solar",
    "/industrial-solar",
    "/gated-communities",
    "/ground-mounted-solar",
    "/on-grid-solar",
    "/hybrid-solar",
    "/off-grid-solar",
    "/bess",
    "/solar-epc",
    "/solar-kits",
    "/mounting-structures",
    "/tin-shed-solar",
    "/solar-cleaning",
    "/solar-water-pumps",
    "/brands",
    "/how-it-works",
    "/why-mrglow",
    "/solar-calculator",
    "/solar-subsidy",
    "/faq",
    "/book-consultation",
    "/projects",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
