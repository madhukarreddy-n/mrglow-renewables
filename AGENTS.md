# Agent guide — Mr.GLOW RENEWABLES

This repo is a **Next.js 15 App Router** product: public solar website, client-side savings calculator, consultation leads, and a staff portal (workflow + proposals + photos). **Supabase** is Postgres, Auth, and Storage. Email is Resend or Brevo. Nested `AGENTS.md` files apply under the folders they sit in.

Human setup, env vars, and Windows/`npm.cmd` notes: `README.md`. Data model: `docs/DATA_MODEL.md` (DDL source of truth: `schema.sql` / `supabase/schema.sql`).

## Product truth

- Legal name (company entity in copy, footer, terms, schema `legalName`): **Mr.GLOW RENEWABLES PVT LTD**
- Brand short (`brandName`, titles, everyday “Mr.GLOW”): **Mr.GLOW RENEWABLES**
- Wordmark: `BrandWordmark` / `GlowO` in `src/components/site/logo.tsx` — GLOW one colour; O is the same letter size as G/L/W; orange bolt **cuts through** the O at forward ~45°. Full lockup art: `public/brand/logo-lockup.jpg`
- Identity fields are locked in `src/lib/brand.ts`. Contact is not an Admin CMS field.
- Verified public contact only: email `mrglowrenewables@gmail.com`, site `www.mrglowrenewables.in`, location **Hyderabad** (no street address), phone/WhatsApp `9912343142`.
- Do **not** invent awards, OEM partnerships, project counts, testimonials, or statistics.
- Named brand logos on the site only when real published artwork exists. Otherwise use component categories, not fake partners.
- Do not use “MR Glow Energy Resources” or “MrGlow Renewables” in new copy.



## Layout


| Area                     | Path                                              |
| ------------------------ | ------------------------------------------------- |
| Public pages             | `src/app/(site)`                                  |
| Public chrome            | `src/components/site`                             |
| Brochure / offering copy | `src/content`                                     |
| Staff portal             | `src/app/admin`                                   |
| APIs                     | `src/app/api`                                     |
| Calculator (pure TS)     | `src/lib/calculator/engine.ts`                    |
| Auth / workflow          | `src/lib/supabase`, `src/lib/workflow.ts`         |
| BOM / estimate PDF       | `src/lib/bom.ts`, `src/lib/proposal-pdf.ts`       |
| Schema                   | `schema.sql` (copy also in `supabase/schema.sql`) |




## Commands (Windows: `npm.cmd` if `npm.ps1` is blocked)

```powershell
npm.cmd run dev
```

URLs: site `http://localhost:3000`, staff `http://localhost:3000/admin/login`.

## Engineering rules

- TypeScript, server-first mutations in Route Handlers. Check the caller's `employees.role` on the server.
- Calculator **formulas** stay in `engine.ts`. The wizard may **call** `calculateSolarSavings`; do not duplicate slab math in JSX.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or email API keys in client bundles.
- Do not commit `.env`. Use `.env.example`.
- Prefer editing existing modules. Match Tailwind (`navy`, `lime`, `btn-primary`).
- Do not invent extra contact channels, offices, or phone numbers.



## Lead record

The **lead row** is the source of truth for workflow, assignment, and proposals. Do not add a second customer table that the proposal ignores.