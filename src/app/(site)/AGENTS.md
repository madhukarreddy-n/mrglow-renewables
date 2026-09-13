# Public website pages

Routes under `src/app/(site)`. Shared chrome: `layout.tsx` + `src/components/site` (`header`, `footer`, `logo.tsx` `NAV`). Wordmark rules: `src/components/site/AGENTS.md`.

## Patterns

- Solution-style pages: `SolutionPage` + `solutionMetadata` from `src/components/site/solution-page.tsx`.
- Header: white bar, phone, gold **Get a Quote**. Nav: Rooftop Solar / More (see `logo.tsx` `NAV`).
- Homepage: hero + 3-step `QuoteWizard`, 4 steps, `HomeCalculator`. Do not copy competitor discounts, review scores, or app/insurance claims.
- Consultation: `ConsultationForm`. Maintenance CTA → `/book-consultation?intent=maintenance`. Do not reuse this route for privacy/terms (`/privacy`, `/terms`).
- Calculator UI: `src/components/calculator` calling `calculateSolarSavings` in `engine.ts`. Consultation posts to `/api/public/consultations`.

## Imagery and names

Use `public/brand/` (brochure extracts and `logo-lockup.jpg`). Do not drop Unsplash photos as if they were Mr.GLOW sites. Unpublished projects stay empty on `/projects`. Legal name **Mr.GLOW RENEWABLES PVT LTD**; short **Mr.GLOW RENEWABLES**.
