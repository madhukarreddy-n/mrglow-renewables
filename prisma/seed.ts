import { PrismaClient, Role, LeadStatus, LeadSource, CustomerCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/settings";
import { INDIAN_STATES } from "../src/lib/india-states";

const prisma = new PrismaClient();

const FAQS = [
  ["What is rooftop solar?", "Rooftop solar uses photovoltaic panels on your roof to generate electricity for on-site use, with surplus typically exported through net metering where available."],
  ["How much can I save?", "Savings depend on your electricity consumption, tariff, system size, site conditions and applicable policies. Use the solar calculator for an estimate, then confirm with a site survey."],
  ["How many panels do I need?", "Panel count depends on required capacity and panel wattage. The calculator estimates both from your bill or monthly units."],
  ["How does government subsidy work?", "Residential rooftop programmes may offer subsidy for eligible DCR systems, subject to government rules, documentation and policy changes. Amounts shown in the calculator are estimates only."],
  ["What is DCR?", "DCR (Domestic Content Requirement) typically refers to systems that use domestically manufactured solar cells and modules as required by applicable subsidy guidelines."],
  ["What is Non-DCR?", "Non-DCR systems do not follow domestic-content subsidy requirements. They may still be installed, but estimated subsidy generally does not apply."],
  ["What is net metering?", "Net metering is a utility arrangement that credits surplus solar electricity exported to the grid, subject to DISCOM rules and approvals."],
  ["How long does installation take?", "Timelines vary by system size, site readiness, material availability and approvals. A site survey is used to confirm a realistic schedule."],
  ["How long do solar panels last?", "Solar panels are typically designed for decades of generation, with output declining gradually. Exact warranty terms are confirmed in your quotation."],
  ["What maintenance is required?", "Periodic cleaning, electrical inspection and inverter checks help sustain generation. Mr.GLOW can support service and AMC after installation."],
  ["What happens during cloudy weather?", "Generation reduces when sunlight is limited. Grid-connected systems continue to draw electricity from the grid when solar output is lower."],
  ["What is payback period?", "Simple payback is estimated net investment divided by estimated first-year savings. It is an estimate, not a guarantee."],
  ["Can businesses install solar?", "Yes. Commercial rooftops can reduce operating electricity costs. Use the commercial calculator path or book a consultation."],
  ["Can industries install solar?", "Yes. Industrial facilities often have high consumption and large roof or land area. Engineering and electrical design are confirmed after survey."],
];

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMeNow!2026";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@mrglowrenewables.in";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.setting.upsert({
    where: { key: "company" },
    update: {},
    create: { key: "company", value: DEFAULT_SETTINGS as object },
  });

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN, active: true },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "sales@mrglowrenewables.in" },
    update: {},
    create: {
      email: "sales@mrglowrenewables.in",
      name: "Demo Sales Executive",
      passwordHash,
      role: Role.SALES_EXECUTIVE,
    },
  });

  await prisma.calculatorConfig.deleteMany({ where: { version: 1 } });
  await prisma.calculatorConfig.create({
    data: {
      version: 1,
      name: "Default India assumptions v1",
      systemCostPerKwp: 60000,
      panelWattage: 550,
      peakSunHours: 5.0,
      generationFactor: 1,
      systemEfficiency: 0.8,
      roofAreaPerKwp: 8,
      annualDegradation: 0.007,
      tariffEscalation: 0.03,
      maintenancePct: 0.01,
      projectLifetime: 30,
      co2KgPerKwh: 0.82,
      treesPerTonCo2: 16,
      unitsPerKwMonth: 120,
      active: true,
    },
  });

  const highSun = ["RJ", "GJ", "TS", "AP", "KA", "TN", "MH"];
  for (const code of INDIAN_STATES.map((s) => s.code)) {
    if (!highSun.includes(code)) continue;
    await prisma.calculatorConfig.create({
      data: {
        version: 1,
        name: `${code} peak sun hours override`,
        stateCode: code,
        systemCostPerKwp: 60000,
        panelWattage: 550,
        peakSunHours: 5.4,
        generationFactor: 1,
        systemEfficiency: 0.8,
        roofAreaPerKwp: 8,
        annualDegradation: 0.007,
        tariffEscalation: 0.03,
        maintenancePct: 0.01,
        projectLifetime: 30,
        co2KgPerKwh: 0.82,
        treesPerTonCo2: 16,
        unitsPerKwMonth: 120,
        extra: { note: "Configurable state-level assumption. Verify before publishing." },
      },
    });
  }

  await prisma.subsidyConfig.deleteMany({ where: { version: 1 } });
  await prisma.subsidyConfig.create({
    data: {
      version: 1,
      name: "Residential DCR estimate (admin-verified required)",
      category: "RESIDENTIAL",
      subsidyType: "DCR",
      maxSubsidy: 78000,
      slabs: [
        { upToKwp: 2, amountPerKwp: 30000 },
        { upToKwp: 3, amountPerKwp: 18000 },
        { upToKwp: null, amountPerKwp: 0 },
      ],
      notes:
        "Placeholder subsidy configuration. Update in Admin to match the latest verified government programme. Never present as guaranteed.",
      active: true,
    },
  });

  await prisma.systemPricing.deleteMany({ where: { version: 1 } });
  for (const category of ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"] as CustomerCategory[]) {
    await prisma.systemPricing.create({
      data: {
        version: 1,
        category,
        costPerKwp: category === "RESIDENTIAL" ? 60000 : category === "COMMERCIAL" ? 52000 : 48000,
        active: true,
      },
    });
  }

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: FAQS.map(([question, answer], i) => ({
        question,
        answer,
        sortOrder: i,
        published: true,
      })),
    });
  }

  await prisma.contentBlock.upsert({
    where: { slug: "components" },
    update: {},
    create: {
      slug: "components",
      title: "What Goes Into Your Solar System?",
      body: [
        { name: "Solar Panels", text: "Convert sunlight into DC electricity. Quantity and wattage are sized to your energy need and available area." },
        { name: "Inverter", text: "Converts DC electricity from panels into AC electricity used by your home or facility." },
        { name: "Mounting Structure", text: "Holds panels at the designed tilt and orientation, engineered for wind and roof or ground conditions." },
        { name: "DC / AC Protection", text: "Combiner boxes, isolators and surge protection help keep the electrical system safe." },
        { name: "Cables & Connectors", text: "Carry power from the array to the inverter and onward to your electrical system." },
        { name: "Monitoring System", text: "Tracks generation so performance can be reviewed over time." },
      ],
    },
  });

  const existingDemo = await prisma.lead.count({ where: { isDemo: true } });
  if (existingDemo === 0) {
    const sales = await prisma.user.findUnique({ where: { email: "sales@mrglowrenewables.in" } });
    const statuses: LeadStatus[] = [
      "NEW", "CONTACTED", "QUALIFIED", "SITE_SURVEY_PENDING", "SITE_SURVEY_SCHEDULED",
      "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST", "ON_HOLD",
    ];
    const cats: CustomerCategory[] = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"];
    const states = ["TS", "AP", "KA", "MH", "TN"];
    for (let i = 0; i < 10; i++) {
      const lead = await prisma.lead.create({
        data: {
          leadNumber: `MRG-DEMO-${String(i + 1).padStart(3, "0")}`,
          name: `Demo Lead ${i + 1}`,
          phone: `90000000${String(10 + i)}`,
          email: `demo.lead${i + 1}@example.com`,
          pincode: "500001",
          state: states[i % states.length],
          category: cats[i % cats.length],
          monthlyBill: 2500 + i * 800,
          source: i % 2 === 0 ? LeadSource.SOLAR_CALCULATOR : LeadSource.WEBSITE,
          status: statuses[i],
          assignedToId: sales?.id,
          isDemo: true,
          activities: {
            create: { type: "LEAD_CREATED", message: "Demo lead seeded for development." },
          },
        },
      });
      if (i < 3) {
        await prisma.followUp.create({
          data: {
            leadId: lead.id,
            assignedToId: sales?.id,
            type: "CALL",
            dueAt: new Date(Date.now() + (i - 1) * 86400000),
            notes: "Demo follow-up",
          },
        });
      }
    }

    const won = await prisma.lead.findFirst({ where: { leadNumber: "MRG-DEMO-008" } });
    if (won) {
      const customer = await prisma.customer.create({
        data: {
          customerNumber: "CUST-DEMO-001",
          leadId: won.id,
          name: "Demo Customer 1",
          phone: won.phone,
          email: won.email,
          state: "TS",
          pincode: "500001",
          category: "RESIDENTIAL",
          status: "ACTIVE",
          isDemo: true,
        },
      });
      await prisma.customer.create({
        data: {
          customerNumber: "CUST-DEMO-002",
          name: "Demo Customer 2",
          phone: "9000000099",
          category: "COMMERCIAL",
          status: "COMMISSIONED",
          isDemo: true,
        },
      });
      await prisma.customer.create({
        data: {
          customerNumber: "CUST-DEMO-003",
          name: "Demo Customer 3",
          phone: "9000000098",
          category: "INDUSTRIAL",
          status: "INSTALLATION",
          isDemo: true,
        },
      });
      const plant = await prisma.solarPlant.create({
        data: {
          plantId: "PLANT-DEMO-001",
          customerId: customer.id,
          capacityKwp: 5,
          expectedMonthlyGeneration: 600,
          expectedAnnualGeneration: 7200,
          status: "ACTIVE",
          isDemo: true,
        },
      });
      await prisma.solarPlant.create({
        data: {
          plantId: "PLANT-DEMO-002",
          customerId: customer.id,
          capacityKwp: 10,
          status: "COMMISSIONED",
          isDemo: true,
        },
      });
      await prisma.plantGeneration.create({
        data: {
          plantId: plant.id,
          periodDate: new Date("2026-07-01"),
          periodType: "MONTH",
          actualKwh: 580,
          expectedKwh: 600,
          source: "MANUAL",
        },
      });
      await prisma.plantSaving.create({
        data: {
          plantId: plant.id,
          periodDate: new Date("2026-07-01"),
          periodType: "MONTH",
          actualSavings: 5220,
          expectedSavings: 5400,
          tariffUsed: 9,
        },
      });
      await prisma.serviceRequest.create({
        data: {
          ticketNumber: "SRV-DEMO-001",
          customerId: customer.id,
          plantId: plant.id,
          type: "PANEL_CLEANING",
          description: "Demo cleaning request",
          status: "OPEN",
        },
      });
      await prisma.amcContract.create({
        data: {
          customerId: customer.id,
          plantId: plant.id,
          planName: "Demo AMC",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          frequency: "QUARTERLY",
          nextService: new Date("2026-09-01"),
          status: "ACTIVE",
        },
      });
    }

    const surveyLeads = await prisma.lead.findMany({
      where: { leadNumber: { in: ["MRG-DEMO-004", "MRG-DEMO-005", "MRG-DEMO-006"] } },
    });
    for (const [i, lead] of surveyLeads.entries()) {
      await prisma.siteSurvey.create({
        data: {
          surveyNumber: `SUR-DEMO-00${i + 1}`,
          leadId: lead.id,
          address: "Hyderabad (demo)",
          status: i === 0 ? "SCHEDULED" : i === 1 ? "COMPLETED" : "PENDING",
        },
      });
    }

    const quoteLeads = await prisma.lead.findMany({
      where: { leadNumber: { in: ["MRG-DEMO-006", "MRG-DEMO-007", "MRG-DEMO-008"] } },
    });
    for (const [i, lead] of quoteLeads.entries()) {
      await prisma.quotation.create({
        data: {
          quotationNumber: `QT-DEMO-00${i + 1}`,
          leadId: lead.id,
          systemCapacity: 5 + i,
          grossCost: 300000 + i * 40000,
          subsidy: i === 0 ? 78000 : 0,
          discount: 0,
          netCost: 300000 + i * 40000 - (i === 0 ? 78000 : 0),
          status: i === 2 ? "ACCEPTED" : "SENT",
          items: {
            create: [
              { description: "Solar modules (demo)", quantity: 10, unit: "nos", unitPrice: 18000, amount: 180000 },
            ],
          },
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin login:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
