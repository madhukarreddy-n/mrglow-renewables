# Admin CRM

JWT cookie + `src/middleware.ts` (login page excluded). Every write: `requirePermission(...)` from `src/lib/auth/session.ts` using `PERMISSIONS` in `src/lib/auth/rbac.ts`. API routes: `requireApiPermission`.

## Lead workspace (required model)

`src/app/admin/leads/[id]/page.tsx` + `src/components/admin/lead-workspace.tsx`.

Tabs must keep **one** customer record:

| Tab | Data | Persistence |
| --- | --- | --- |
| Site Survey | Roof, load, kWp, Excel import | `SiteSurvey` via `saveLeadSurvey` |
| Design | Images, order, include-in-proposal | `LeadDesign` + `/api/admin/leads/[id]/designs` |
| Products & Pricing | Line items | `LeadLineItem` via `saveLeadPricing` |
| Proposal | Subsidy/discount/terms + PDF | `generateProposalFromLead` + `/api/admin/leads/[id]/proposal` |

Excel: `/api/admin/surveys/import` + `src/lib/survey` (header row **or** Field/Value). Template: `/api/admin/surveys/template`. Map headers; do not assume a fixed Teams filename. Preview in the form **before** save.

Uploads: `src/lib/storage` → `uploads/` (not public). Serve with `/api/files/[...key]` (auth required).

## Demo data

Seed `isDemo` leads stay in admin. Never treat them as public statistics or testimonials.
