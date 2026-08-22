import { calculateSolarSavings } from "../src/lib/calculator/engine";

const result = calculateSolarSavings(
  {
    mode: "BILL",
    monthlyBill: 5000,
    stateCode: "TS",
    category: "RESIDENTIAL",
    subsidyType: "DCR",
    unitCost: 7,
  },
  {
    version: 1,
    stateCode: "TS",
    category: "RESIDENTIAL",
    subsidyType: "DCR",
    systemCostPerKwp: 60000,
    panelWattage: 550,
    peakSunHours: 5,
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
      type: "DCR",
      eligible: true,
      maxSubsidy: 78000,
      slabs: [
        { upToKwp: 2, amountPerKwp: 30000 },
        { upToKwp: 3, amountPerKwp: 18000 },
        { upToKwp: null, amountPerKwp: 0 },
      ],
    },
  },
);

console.log(JSON.stringify({
  kwp: result.recommendedKwp,
  annual: result.annualSavings,
  net: result.netInvestment,
  subsidy: result.estimatedSubsidy,
  payback: result.paybackYears,
}, null, 2));
