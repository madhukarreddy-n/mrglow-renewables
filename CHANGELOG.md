# Changelog

## 2026-09-13

- Admin **Proposals** and **BOM** menus for all staff. After a lead is contacted, generate a BOM-based estimate (`EST-001-V1` style), store PDF on the lead, share, then add product photos.
- Admins manage brand unit costs from the 3 kW Bill of Materials catalogue. GST defaults: 5% modules/inverters, 18% other lines.
- Staff can see all leads and proposals (assignment is no longer a visibility filter).

## 2026-09-12

- Rebuilt the product on the costless stack: one Next.js app, Supabase (Postgres, Auth, Storage), Resend/Brevo email, Vercel hosting.
- First-admin setup at `/admin/login` (`GET`/`POST /api/setup`), `GET /api/me`, and middleware now guards `/admin` itself.
- Calculator estimates run in the browser via `src/lib/calculator/engine.ts`; consultation posts to `POST /api/public/consultations`.
- Staff portal workflow: submitted → contacted → proposal_shared → confirmed_install → payment_done → installation_in_progress → installation_done, with `status_history` and shareable proposals.
- Removed Prisma, Docker Postgres, JWT cookie auth, and the previous CRM surfaces (surveys, plants, AMC, quotations as separate systems).
