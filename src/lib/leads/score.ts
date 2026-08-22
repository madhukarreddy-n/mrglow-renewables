import { CalculatorInput, CalculatorResult, CALCULATOR_DISCLAIMER, SUBSIDY_DISCLAIMER } from "../calculator/engine";

export function scoreFromCalculator(input: CalculatorInput, result: CalculatorResult) {
  let score = 20;
  if (result.recommendedKwp >= 3) score += 10;
  if (result.recommendedKwp >= 10) score += 10;
  if ((input.monthlyBill ?? 0) >= 4000) score += 10;
  if ((input.monthlyBill ?? 0) >= 8000) score += 10;
  if (input.category !== "RESIDENTIAL") score += 15;
  return Math.min(100, score);
}

export function scoreConsultation(billRange?: string | null) {
  let score = 25;
  if (billRange === "₹4,000 – ₹8,000") score += 15;
  if (billRange === "More than ₹8,000") score += 25;
  return Math.min(100, score);
}

export { CALCULATOR_DISCLAIMER, SUBSIDY_DISCLAIMER };
