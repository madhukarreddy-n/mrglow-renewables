# Solar calculator engine

All math lives in `engine.ts` (`calculateSolarSavings`). The public wizard and homepage teaser **call** it with `DEFAULT_CALCULATOR_PARAMS`. Do not copy subsidy slabs or payback formulas into JSX.

Defaults are indicative (not a DISCOM or MNRE quotation). Keep the financial / subsidy / calculator disclaimers exported from the engine.
