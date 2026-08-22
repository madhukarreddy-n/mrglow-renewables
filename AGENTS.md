# Agent guide — Mr.GLOW RENEWABLES

This repo is a **Next.js 15 App Router** product: public solar website, savings calculator, consultation leads, and admin CRM (surveys, designs, quotations, plants, service). PostgreSQL via Prisma. Nested `AGENTS.md` files apply when you work in those folders.

Human setup, **start / stop / restart**, env vars, and Windows/`npm.cmd` notes: `README.md` (section *Start, stop, and restart*). Architecture: `docs/ARCHITECTURE.md`.

## Product truth

- Legal name (company entity in copy, footer, terms, schema `legalName`): **Mr.GLOW RENEWABLES PVT LTD**
- Brand short (`brandName`, titles, everyday “Mr.GLOW”): **Mr.GLOW RENEWABLES**
- Wordmark: `BrandWordmark` / `GlowO` in `src/components/site/logo.tsx` — GLOW one colour; O is the same letter size as G/L/W; orange bolt **cuts through** the O at forward ~45°. Full lockup art: `public/brand/logo-lockup.jpg` (header emblem crop + footer/about lockup).
- Identity fields are locked in `src/lib/settings.ts` (`legalName`, `brandName`, tagline, about, mission, vision, hero) over Admin DB values. Contact remains editable.
- Verified public contact only: email `mrglowrenewables@gmail.com`, site `www.mrglowrenewables.in`, location **Hyderabad** (no street address), phone/WhatsApp `9912343142`.
- Do **not** invent awards, OEM partnerships, project counts, testimonials, or statistics. Public stats only if `publishStatistics` is on and values are real.
- Named brand logos on the site only from **published** `ShowcaseBrand` rows. Otherwise use component categories, not fake partners.
- Do not use “MR Glow Energy Resources” or “MrGlow Renewables” in new copy.

## Layout

| Area | Path |
| --- | --- |
| Public pages | `src/app/(site)` |
| Public chrome | `src/components/site` |
| Brochure / offering copy | `src/content` |
| Admin CRM | `src/app/admin` |
| APIs | `src/app/api` |
| Calculator (pure TS) | `src/lib/calculator` |
| Auth / RBAC | `src/lib/auth` |
| Schema | `prisma/schema.prisma` |

## Commands (Windows: `npm.cmd` if `npm.ps1` is blocked)

```powershell
npm.cmd run docker:up
npm.cmd run dev
```

Stop site: `Ctrl+C` in the `dev` terminal. Stop Postgres (keep data): `npm.cmd run docker:down`. First-time / after DB wipe: `npm.cmd run setup:local`. If port 3000 stays in use, `netstat -ano | findstr :3000` then `taskkill /PID <listening-pid> /T /F`.

URLs: site `http://localhost:3000`, admin `http://localhost:3000/admin/login`.

After schema changes: `npx.cmd prisma migrate dev` (or SQL under `prisma/migrations` + `migrate deploy`). Stop `next dev` before `prisma generate` if Windows locks `query_engine-windows.dll.node`.

## Engineering rules

- TypeScript, server-first. Mutations: server actions (`src/app/admin/actions.ts`) or route handlers with `requirePermission` / `requireApiPermission`.
- Never put calculator formulas in React. Never put secrets in client bundles.
- Do not commit `.env`. Use `.env.example`.
- Prefer editing existing modules over new parallel systems. Match surrounding naming and Tailwind (`navy`, `lime`, `btn-primary`).
- Do not rewrite `README.md` or add docs unless asked.
- Do not invent extra contact channels, offices, or phone numbers.

## Lead profile (CRM)

The **lead record** is the source of truth for site survey, design images, line items, and proposal PDF. Do not add duplicate customer/survey/price forms that the proposal ignores. See `src/app/admin/AGENTS.md`.
