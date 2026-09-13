# Decisions

## 2026-09-13 — Staff-wide proposals and admin BOM catalogue

Employees can see every lead and proposal so the Proposals menu is usable for the whole team. Assignment remains admin-only. Catalogue prices live in `bom_items`; estimates snapshot lines onto the lead as `EST-00N-VN` PDFs. Shared estimates lock price/BOM but still accept product photos.

## 2026-09-12 — Supabase instead of RDS + Prisma + Docker

Free-tier Postgres, Auth, and private Storage in one project. No containers to run locally for the database, no Prisma migrate step on Vercel. Schema is applied as SQL (`schema.sql`) so RLS policies stay next to the tables.

## 2026-09-12 — One Next.js app instead of a separate API

Public site, `/admin`, and Route Handlers share one Vercel project and one deploy. Staff auth is the Supabase session cookie, refreshed in middleware. A separate API service would add hosting and CORS with no extra capability we need.

## 2026-09-12 — Resend or Brevo instead of SES

Both have a permanent free (or hobby) path without AWS IAM. The sender tries Resend first, then Brevo. Missing keys must not break lead insert.

## 2026-09-12 — Calculator math in `engine.ts`, executed on the client

`BUILD_PROMPT.md` requires the estimate to stay client-side. Formulas remain in one TypeScript module (`DEFAULT_CALCULATOR_PARAMS` included) so React does not reimplement slabs. Consultation still posts to the server.

## 2026-09-12 — Forward-only seven-status pipeline

Replaces the previous CRM statuses (NEW, QUALIFIED, WON, plants, AMC, …). One lead row plus proposals and photos is enough for install tracking without a second customer database.

## 2026-09-12 — Service role for public writes/reads

RLS keeps anon users off `leads`. The website form and shared proposal page therefore use the service role only inside Route Handlers / server components, never in the browser bundle.
