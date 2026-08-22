export type CustomerCategory = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL";
export type SubsidyType = "DCR" | "NON_DCR" | "NONE";
export type UsageMode = "BILL" | "UNITS";

export type CalculatorInput = {
  mode: UsageMode;
  monthlyBill?: number;
  monthlyUnits?: number;
  stateCode: string;
  category: CustomerCategory;
  subsidyType: SubsidyType;
  unitCost: number;
};

export type SubsidySlab = {
  upToKwp: number | null;
  amountPerKwp: number;
};

export type CalculatorParameters = {
  version: number;
  stateCode: string | null;
  category: CustomerCategory | null;
  subsidyType: string | null;
  systemCostPerKwp: number;
  panelWattage: number;
  peakSunHours: number;
  generationFactor: number;
  systemEfficiency: number;
  roofAreaPerKwp: number;
  annualDegradation: number;
  tariffEscalation: number;
  maintenancePct: number;
  projectLifetime: number;
  co2KgPerKwh: number;
  treesPerTonCo2: number;
  unitsPerKwMonth: number;
  subsidy: {
    type: string;
    slabs: SubsidySlab[];
    maxSubsidy: number;
    eligible: boolean;
    notes?: string;
  };
};

export type YearProjection = {
  year: number;
  generationKwh: number;
  savings: number;
  cumulativeSavings: number;
  netPosition: number;
};

export type CalculatorResult = {
  monthlyUnits: number;
  recommendedKwp: number;
  panelCount: number;
  roofAreaSqm: number;
  systemType: string;
  dailyGenerationKwh: number;
  peakSunHours: number;
  monthlyGenerationKwh: number;
  annualGenerationKwh: number;
  lifetimeGenerationKwh: number;
  monthlySavings: number;
  annualSavings: number;
  lifetimeSavings: number;
  systemCost: number;
  estimatedSubsidy: number;
  netInvestment: number;
  paybackYears: number | null;
  annualRoiPct: number | null;
  co2TonsLifetime: number;
  treesEquivalent: number;
  yearly: YearProjection[];
  assumptions: Record<string, string | number | boolean>;
};

function round(n: number, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function monthlyUnitsFromInput(input: CalculatorInput, unitsPerKwMonth: number) {
  if (input.mode === "UNITS") {
    return Math.max(0, input.monthlyUnits ?? 0);
  }
  if (!input.unitCost || input.unitCost <= 0) return 0;
  return Math.max(0, (input.monthlyBill ?? 0) / input.unitCost);
}

function subsidyAmount(kwp: number, params: CalculatorParameters) {
  if (!params.subsidy.eligible) return 0;
  let remaining = kwp;
  let previous = 0;
  let total = 0;
  const slabs = [...params.subsidy.slabs].sort(
    (a, b) => (a.upToKwp ?? 9999) - (b.upToKwp ?? 9999),
  );
  for (const slab of slabs) {
    const cap = slab.upToKwp ?? remaining + previous;
    const band = Math.max(0, Math.min(remaining, cap - previous));
    total += band * slab.amountPerKwp;
    remaining -= band;
    previous = cap;
    if (remaining <= 0) break;
  }
  return Math.min(total, params.subsidy.maxSubsidy);
}

export function calculateSolarSavings(
  input: CalculatorInput,
  params: CalculatorParameters,
): CalculatorResult {
  const monthlyUnits = monthlyUnitsFromInput(input, params.unitsPerKwMonth);
  const annualUnits = monthlyUnits * 12;
  const specificYield = params.peakSunHours * 365 * params.systemEfficiency * params.generationFactor;
  const rawKwp = specificYield > 0 ? annualUnits / specificYield : 0;
  const recommendedKwp = round(Math.max(0, rawKwp), 2);
  const panelCount = recommendedKwp > 0 ? Math.ceil((recommendedKwp * 1000) / params.panelWattage) : 0;
  const roofAreaSqm = round(recommendedKwp * params.roofAreaPerKwp, 1);
  const dailyGenerationKwh = round(recommendedKwp * params.peakSunHours * params.systemEfficiency * params.generationFactor, 1);
  const monthlyGenerationKwh = round(dailyGenerationKwh * 30.44, 0);
  const firstYearGeneration = dailyGenerationKwh * 365;

  let lifetimeGeneration = 0;
  let lifetimeSavings = 0;
  let tariff = input.unitCost;
  const yearly: YearProjection[] = [];
  for (let year = 1; year <= params.projectLifetime; year++) {
    const gen = firstYearGeneration * (1 - params.annualDegradation) ** (year - 1);
    const savings = gen * tariff;
    lifetimeGeneration += gen;
    lifetimeSavings += savings;
    yearly.push({
      year,
      generationKwh: round(gen, 0),
      savings: round(savings, 0),
      cumulativeSavings: round(lifetimeSavings, 0),
      netPosition: 0,
    });
    tariff *= 1 + params.tariffEscalation;
  }

  const systemCost = round(recommendedKwp * params.systemCostPerKwp, 0);
  const estimatedSubsidy = round(subsidyAmount(recommendedKwp, params), 0);
  const netInvestment = Math.max(0, round(systemCost - estimatedSubsidy, 0));
  yearly.forEach((y) => {
    y.netPosition = round(y.cumulativeSavings - netInvestment, 0);
  });

  const annualSavings = yearly[0]?.savings ?? 0;
  const monthlySavings = round(annualSavings / 12, 0);
  const paybackYears =
    annualSavings > 0 ? round(netInvestment / annualSavings, 1) : null;
  const annualRoiPct =
    netInvestment > 0 ? round((annualSavings / netInvestment) * 100, 1) : null;
  const co2TonsLifetime = round((lifetimeGeneration * params.co2KgPerKwh) / 1000, 1);
  const treesEquivalent = Math.round(co2TonsLifetime * params.treesPerTonCo2);

  const systemType =
    input.category === "RESIDENTIAL"
      ? "Rooftop solar (estimated)"
      : input.category === "COMMERCIAL"
        ? "Commercial rooftop (estimated)"
        : "Industrial / large rooftop (estimated)";

  return {
    monthlyUnits: round(monthlyUnits, 0),
    recommendedKwp,
    panelCount,
    roofAreaSqm,
    systemType,
    dailyGenerationKwh,
    peakSunHours: params.peakSunHours,
    monthlyGenerationKwh,
    annualGenerationKwh: round(firstYearGeneration, 0),
    lifetimeGenerationKwh: round(lifetimeGeneration, 0),
    monthlySavings,
    annualSavings,
    lifetimeSavings: round(lifetimeSavings, 0),
    systemCost,
    estimatedSubsidy,
    netInvestment,
    paybackYears,
    annualRoiPct,
    co2TonsLifetime,
    treesEquivalent,
    yearly,
    assumptions: {
      monthlyUnits: round(monthlyUnits, 1),
      unitCost: input.unitCost,
      peakSunHours: params.peakSunHours,
      systemEfficiency: params.systemEfficiency,
      generationFactor: params.generationFactor,
      estimatedAnnualGeneration: round(firstYearGeneration, 0),
      systemCostPerKwp: params.systemCostPerKwp,
      subsidyEligible: params.subsidy.eligible,
      lifetime: params.projectLifetime,
      degradation: params.annualDegradation,
      tariffEscalation: params.tariffEscalation,
      calculationVersion: params.version,
    },
  };
}

export const FINANCIAL_DISCLAIMER =
  "Solar savings, system cost, subsidy, payback and ROI shown are estimates based on the information and assumptions provided. Actual results may vary based on electricity consumption, tariff, site conditions, system design, weather, government policies, equipment, financing and other factors.";

export const SUBSIDY_DISCLAIMER =
  "Estimated subsidy. Subsidy eligibility and amount are subject to applicable government rules, system eligibility, documentation and policy changes.";

export const CALCULATOR_DISCLAIMER =
  "Solar savings shown are estimates based on the information and assumptions provided. Actual generation, savings, subsidy eligibility and project cost may vary based on site conditions, electricity tariff, government policies, system design and other factors.";
