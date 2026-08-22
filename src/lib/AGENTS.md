# Shared libraries

- **Auth:** `auth/session.ts` (JWT cookie), `auth/rbac.ts`, `auth/api.ts` for route handlers. Do not check roles only in the UI.
- **Settings:** `settings.ts` — contact is admin-editable. Locked to defaults: `legalName` (**Mr.GLOW RENEWABLES PVT LTD**), `brandName` (**Mr.GLOW RENEWABLES**), tagline, about, mission, vision, hero.
- **DB:** `db.ts` Prisma singleton. Missing `DATABASE_URL` (Vercel build) uses a placeholder; `isDatabaseConfigured()` skips queries. Public pages still render.
- **Email:** `email/send.ts` — no-op/log when SMTP is empty.
- **Storage:** `storage/index.ts` — local `uploads/`; do not put customer files in `public/`.
- **PDF:** `pdf/` — `@react-pdf/renderer`. Proposal images as data URIs from disk, only `includeInProposal` designs.
- **Survey Excel:** `survey/excel.ts` aliases + `survey/parse-workbook.ts`. Prefer more header aliases over a rigid column index.
- **Rate limit:** public POST `/api/consultation`, calculator, login.
