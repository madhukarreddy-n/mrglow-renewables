# Public website pages

Routes under `src/app/(site)`. Shared chrome: `layout.tsx` + `src/components/site` (`header`, `footer`, `logo.tsx` `NAV`). Wordmark rules: `src/components/site/AGENTS.md`.

## Patterns

- Solution-style pages: `SolutionPage` + `solutionMetadata` from `src/components/site/solution-page.tsx`.
- Homepage sections (brands, kits, mounting, tin shed, cleaning) stay in sync with `src/content/offerings.ts` and `/brands`, `/solar-kits`, `/mounting-structures`, `/tin-shed-solar`, `/solar-cleaning`.
- Consultation: `ConsultationForm`. Maintenance CTA → `/book-consultation?intent=maintenance`. Do not reuse this route for privacy/terms (`/privacy`, `/terms`).
- Calculator UI: `src/components/calculator` calling `/api/calculator` only — no formulas in the wizard.

## Imagery and names

Use `public/brand/` (brochure extracts and `logo-lockup.jpg`). Do not drop Unsplash photos as if they were Mr.GLOW sites. Unpublished projects stay empty on `/projects`. Legal name **Mr.GLOW RENEWABLES PVT LTD**; short **Mr.GLOW RENEWABLES**.
