import { prisma, isDatabaseConfigured } from "./db";

export type CompanySettings = {
  legalName: string;
  brandName: string;
  tagline: string;
  email: string;
  website: string;
  location: string;
  phone: string;
  whatsapp: string;
  publishStatistics: boolean;
  statistics: {
    installations: string;
    kwpInstalled: string;
    customerSavings: string;
    homesBusinesses: string;
    yearsExperience: string;
  };
  social: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string };
  heroHeadline: string;
  heroSupport: string;
  about: string;
  mission: string;
  vision: string;
  terms: string;
  privacy: string;
  emailTemplates: {
    leadNotifySubject: string;
    leadConfirmSubject: string;
  };
};

export const DEFAULT_SETTINGS: CompanySettings = {
  legalName: "Mr.GLOW RENEWABLES PVT LTD",
  brandName: "Mr.GLOW RENEWABLES",
  tagline: "Powering a Greener Tomorrow",
  email: "mrglowrenewables@gmail.com",
  website: "www.mrglowrenewables.in",
  location: "Hyderabad",
  phone: "9912343142",
  whatsapp: "9912343142",
  publishStatistics: false,
  statistics: {
    installations: "",
    kwpInstalled: "",
    customerSavings: "",
    homesBusinesses: "",
    yearsExperience: "",
  },
  social: {},
  heroHeadline: "Powering a Greener Tomorrow",
  heroSupport: "Innovative Solar Solutions for a Sustainable Future",
  about:
    "Mr.GLOW RENEWABLES PVT LTD is a forward-thinking renewable energy company delivering end-to-end solar and energy storage solutions. We are dedicated to empowering homes, businesses and industries with clean, reliable and affordable energy. From concept to commissioning, we ensure high-performance systems that drive savings and a greener tomorrow.",
  mission:
    "To deliver innovative, reliable and sustainable solar solutions that create value for our customers and contribute to a cleaner planet.",
  vision:
    "To be a trusted leader in renewable energy by driving innovation and building a sustainable future for generations.",
  terms:
    "These Terms of Use govern your use of the Mr.GLOW RENEWABLES PVT LTD website and related services. Information on this site, including calculator estimates, is provided for general guidance and does not constitute a binding offer, guarantee or professional engineering report. Quotations, subsidy eligibility and installation timelines are confirmed after site assessment.",
  privacy:
    "Mr.GLOW RENEWABLES PVT LTD collects contact and electricity-usage information you submit so we can respond to consultation requests and prepare solar assessments. We do not sell personal data. Access to lead and customer records is restricted to authorised team members. Contact mrglowrenewables@gmail.com for privacy questions.",
  emailTemplates: {
    leadNotifySubject: "New solar consultation lead",
    leadConfirmSubject: "We received your solar consultation request",
  },
};

export async function getSettings(): Promise<CompanySettings> {
  if (!isDatabaseConfigured()) return DEFAULT_SETTINGS;
  try {
    const row = await prisma.setting.findUnique({ where: { key: "company" } });
    if (!row) return DEFAULT_SETTINGS;
    const stored = row.value as Partial<CompanySettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      legalName: DEFAULT_SETTINGS.legalName,
      brandName: DEFAULT_SETTINGS.brandName,
      tagline: DEFAULT_SETTINGS.tagline,
      about: DEFAULT_SETTINGS.about,
      mission: DEFAULT_SETTINGS.mission,
      vision: DEFAULT_SETTINGS.vision,
      heroHeadline: DEFAULT_SETTINGS.heroHeadline,
      heroSupport: DEFAULT_SETTINGS.heroSupport,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(value: CompanySettings) {
  await prisma.setting.upsert({
    where: { key: "company" },
    update: { value },
    create: { key: "company", value },
  });
}
