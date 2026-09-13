# Staff portal

Supabase Auth session required (`src/middleware.ts`). Roles live on `employees` (`admin` | `employee`).

- Pipeline, leads, **proposals**, and **BOM** are visible to every staff member. Admins also see Team.
- Status changes: `PATCH /api/leads/[id]/status` + `src/lib/workflow.ts` (forward-only).
- After **contacted**, staff generate a BOM-based estimate (`EST-00N-V1`) stored on the lead. Sharing sets `shared_at` and can move status to `proposal_shared`. Photos can be added after share. Price/BOM cannot.
- Archive / delete on the lead page. Delete removes PDFs and photos from Storage. PDF generate overwrites `{leadId}/{proposalId}.pdf`.
