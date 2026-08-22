# Database

- Provider: **PostgreSQL** (`@db.Decimal` on money and kWp). Do not switch to SQLite.
- Change schema in `schema.prisma`, then a **migration SQL** folder under `migrations/` (this project uses dated folders + `migrate deploy`). Do not rely on `db push` for anything that should match production.
- Lead-centric commercial data: `Lead`, `SiteSurvey`, `LeadDesign`, `LeadLineItem`, `Quotation`. Cascade deletes where the child cannot exist without the lead.
- Seed: `prisma/seed.ts` — demo CRM rows `isDemo: true`. Production: change admin password; do not seed demo as real customers.

Local: Docker `postgres:16-alpine`, `DATABASE_URL` in `.env.example`.
