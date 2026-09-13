# APIs

Public routes use the **service role** server-side only (`POST /api/public/consultations`, `GET /api/public/proposals/[shareToken]`, `GET /api/health`).

Staff routes use the cookie session (`createServerSupabase`) so RLS applies. Admin-only: `POST /api/employees`, BOM create/update/seed.

Contract details: `docs/API.md`.
