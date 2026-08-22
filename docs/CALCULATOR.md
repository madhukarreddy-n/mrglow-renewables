# Calculator engine

Pure TypeScript. UI never contains business formulas.

`calculateSolarSavings(input, params)`:

1. Monthly kWh from bill/unit cost or from units
2. Specific yield = peakSunHours × 365 × efficiency × generationFactor
3. kWp = annual kWh / specific yield
4. Panels = ceil(kWp × 1000 / panelWattage)
5. Daily / monthly / lifetime generation with annual degradation
6. Savings with tariff escalation
7. Cost = kWp × systemCostPerKwp (category pricing table)
8. Estimated subsidy from versioned slabs (residential DCR only when selected)
9. Payback = net investment / year-1 savings
10. ROI = year-1 savings / net investment
11. CO₂ and trees from configurable factors

Admin updates `CalculatorConfig`, `SubsidyConfig`, `SystemPricing` without a frontend deploy.

Reports persist `input_data`, `calculation_parameters`, `calculation_version`, and `results`.
