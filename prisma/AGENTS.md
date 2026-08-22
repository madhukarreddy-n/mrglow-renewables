# Database

- Provider: **PostgreSQL** (`@db.Decimal` on money and kWp). Do not switch to SQLite.
- Change schema in `schema.prisma`, then a **migration SQL** folder under `migrations/` (this project uses dated folders + `migrate deploy`). Do not rely on `db push` for anything that should match production.
- Lead-centric commercial data: `Lead`, `SiteSurvey`, `LeadDesign`, `LeadLineItem`, `Quotation`. Cascade deletes where the child cannot exist without the lead.
- Seed: `prisma/seed.ts` — demo CRM rows `isDemo: true`. Production: change admin password; do not seed demo as real customers.
- Vercel: `DATABASE_URL` must be set at runtime. Build may use a placeholder if it is missing. Prisma engines include `rhel-openssl-3.0.x` for Vercel.

Local: Docker `postgres:16-alpine`, `DATABASE_URL` in `.env.example`.
