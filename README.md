# Mr.GLOW RENEWABLES

Public website, solar savings calculator, and staff portal for **Mr.GLOW RENEWABLES PVT LTD** (Hyderabad). One Next.js app on Vercel. Database, logins, and files live on **Supabase**. Transactional email is **Resend** or **Brevo**.

Legal name: **Mr.GLOW RENEWABLES PVT LTD**. Brand: **Mr.GLOW RENEWABLES**. Public contact: `mrglowrenewables@gmail.com`, `www.mrglowrenewables.in`, phone/WhatsApp `9912343142`. No street address.

## Stack

- Next.js 15 (App Router) in `src/`
- Supabase Postgres + Auth + Storage (`proposal-photos`)
- Vercel (`bom1`)
- Calculator math: `src/lib/calculator/engine.ts` (called from the browser; formulas are not copied into React)

## Local setup

1. Clone the repo.
2. Copy `.env.example` to `.env.local` and fill in values (see below).
3. Create a free Supabase project (region close to India, e.g. Mumbai if offered). In **SQL Editor**, paste and run the full `schema.sql` file (same as `supabase/schema.sql`). This creates tables, RLS, and the `proposal-photos` bucket.
4. Copy **Project URL**, **anon public** key, and **service_role** key from **Project Settings → API** into `.env.local`.
5. `npm.cmd run dev` then open http://localhost:3000/admin/login and use **Create first admin**. Details: `docs/RUNBOOK.md`.

```powershell
npm.cmd install
npm.cmd run dev
```

On Windows, use `npm.cmd` if `npm.ps1` is blocked.

- Site: http://localhost:3000  
- Staff: http://localhost:3000/admin/login  

Stop the app with `Ctrl+C` in the terminal.

## Environment variables

Set these in `.env.local` and in the Vercel project. Names only in `.env.example`.

| Name | Where used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + cookie session |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only: public consult, public proposal, health, employee invite, signed uploads |
| `RESEND_API_KEY` | Email (preferred if set) |
| `BREVO_API_KEY` | Email if Resend is unset |
| `EMAIL_FROM` | Optional From header for Resend |
| `SALES_NOTIFICATION_EMAIL` | Inbox for new leads (defaults to company email) |
| `NEXT_PUBLIC_APP_URL` | Public origin for proposal links (`http://localhost:3000` locally) |
| `SETUP_SECRET` | Optional. Required on `POST /api/setup` so only you can create the first admin |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Deploy (Vercel)

1. Connect the GitHub repo. Framework: Next.js. Region: `bom1` (`vercel.json`).
2. Add the environment variables above (Production + Preview).
3. Point the GoDaddy domain at Vercel if it is not already.
4. Push to `main`. Vercel builds on every push.
5. After the first deploy, confirm `GET /api/health` returns `{ "ok": true }`.
6. GitHub Action `.github/workflows/keep-alive.yml` pings `/api/health` so a free Supabase project does not auto-pause.

There is no Docker, Prisma, or RDS step.

## Useful commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

## Docs

| File | When to update |
| --- | --- |
| `README.md` | Setup steps or env vars change |
| `CHANGELOG.md` | Every feature/fix that reaches `main` |
| `docs/DATA_MODEL.md` | Table/column/relationship change (`schema.sql` is the DDL source of truth) |
| `docs/API.md` | Route added, removed, or contract change |
| `docs/WORKFLOW.md` | Status, transition, or notification change |
| `docs/DECISIONS.md` | Direction that reverses or meaningfully changes a prior choice |
| `docs/RUNBOOK.md` | A new operational failure and its fix |
