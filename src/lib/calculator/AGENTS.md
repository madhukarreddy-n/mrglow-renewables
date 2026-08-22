# Solar calculator engine

All math lives in `engine.ts` (`calculateSolarSavings`). UI and API **call** it; they do not copy formulas.

Config at runtime: `resolve.ts` + versioned Prisma tables (`CalculatorConfig`, subsidy slabs, category pricing). Admin settings update DB — do not hard-code tariffs or subsidy rupees in React.

## Persist reports

Store `input_data`, `calculation_parameters`, `calculation_version`, and `results`. PDF: `src/lib/pdf/solar-report.tsx` from the saved report, not a second calculation path.

## Copy

Keep calculator / subsidy / financial disclaimers from the engine module. Estimates are not a quotation or DISCOM approval.

Detail: `docs/CALCULATOR.md`.
