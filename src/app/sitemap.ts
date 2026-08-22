import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.mrglowrenewables.in";
  const paths = [
    "",
    "/residential-solar",
    "/gated-communities",
    "/commercial-solar",
    "/industrial-solar",
    "/ground-mounted-solar",
    "/how-it-works",
    "/why-mrglow",
    "/solar-calculator",
    "/book-consultation",
    "/projects",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ];
  return paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }));
}
