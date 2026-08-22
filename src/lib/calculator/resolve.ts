import { CustomerCategory, Prisma } from "@prisma/client";
import { prisma } from "../db";
import {
  CalculatorInput,
  CalculatorParameters,
  SubsidySlab,
  SubsidyType,
} from "./engine";

const FALLBACK: CalculatorParameters = {
  version: 1,
  stateCode: null,
  category: null,
  subsidyType: null,
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
  subsidy: {
    type: "NONE",
    slabs: [],
    maxSubsidy: 0,
    eligible: false,
  },
};

function num(v: Prisma.Decimal | number | null | undefined, d: number) {
  if (v == null) return d;
  return Number(v);
}

export function subsidyApplies(category: CalculatorInput["category"], subsidyType: SubsidyType) {
  return category === "RESIDENTIAL" && subsidyType === "DCR";
}

export async function resolveCalculatorParameters(
  input: CalculatorInput,
): Promise<CalculatorParameters> {
  const now = new Date();
  const configs = await prisma.calculatorConfig.findMany({
    where: {
      active: true,
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      effectiveFrom: { lte: now },
    },
    orderBy: { version: "desc" },
  });

  const score = (c: (typeof configs)[0]) => {
    let s = 0;
    if (c.stateCode === input.stateCode) s += 8;
    else if (c.stateCode == null) s += 1;
    else return -1;
    if (c.category === input.category) s += 4;
    else if (c.category == null) s += 1;
    else return -1;
    if (c.subsidyType === input.subsidyType) s += 2;
    else if (c.subsidyType == null) s += 1;
    else return -1;
    return s;
  };

  const ranked = configs
    .map((c) => ({ c, s: score(c) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || b.c.version - a.c.version);

  const chosen = ranked[0]?.c;
  const base: CalculatorParameters = chosen
    ? {
        version: chosen.version,
        stateCode: chosen.stateCode,
        category: chosen.category,
        subsidyType: chosen.subsidyType,
        systemCostPerKwp: num(chosen.systemCostPerKwp, FALLBACK.systemCostPerKwp),
        panelWattage: chosen.panelWattage,
        peakSunHours: num(chosen.peakSunHours, FALLBACK.peakSunHours),
        generationFactor: num(chosen.generationFactor, FALLBACK.generationFactor),
        systemEfficiency: num(chosen.systemEfficiency, FALLBACK.systemEfficiency),
        roofAreaPerKwp: num(chosen.roofAreaPerKwp, FALLBACK.roofAreaPerKwp),
        annualDegradation: num(chosen.annualDegradation, FALLBACK.annualDegradation),
        tariffEscalation: num(chosen.tariffEscalation, FALLBACK.tariffEscalation),
        maintenancePct: num(chosen.maintenancePct, FALLBACK.maintenancePct),
        projectLifetime: chosen.projectLifetime,
        co2KgPerKwh: num(chosen.co2KgPerKwh, FALLBACK.co2KgPerKwh),
        treesPerTonCo2: num(chosen.treesPerTonCo2, FALLBACK.treesPerTonCo2),
        unitsPerKwMonth: num(chosen.unitsPerKwMonth, FALLBACK.unitsPerKwMonth),
        subsidy: FALLBACK.subsidy,
      }
    : { ...FALLBACK };

  const pricing = await prisma.systemPricing.findFirst({
    where: {
      active: true,
      category: input.category as CustomerCategory,
      OR: [{ subsidyType: input.subsidyType }, { subsidyType: null }],
    },
    orderBy: { version: "desc" },
  });
  if (pricing) base.systemCostPerKwp = num(pricing.costPerKwp, base.systemCostPerKwp);

  const eligible = subsidyApplies(input.category, input.subsidyType);
  if (eligible) {
    const subsidy = await prisma.subsidyConfig.findFirst({
      where: {
        active: true,
        category: "RESIDENTIAL",
        subsidyType: "DCR",
        OR: [{ stateCode: input.stateCode }, { stateCode: null }],
      },
      orderBy: [{ stateCode: "desc" }, { version: "desc" }],
    });
    if (subsidy) {
      base.subsidy = {
        type: subsidy.subsidyType,
        slabs: (subsidy.slabs as SubsidySlab[]) ?? [],
        maxSubsidy: num(subsidy.maxSubsidy, 0),
        eligible: true,
        notes: subsidy.notes ?? undefined,
      };
    }
  } else {
    base.subsidy = {
      type: input.subsidyType,
      slabs: [],
      maxSubsidy: 0,
      eligible: false,
    };
  }

  return base;
}
