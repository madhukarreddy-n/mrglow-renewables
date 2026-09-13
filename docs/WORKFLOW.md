# Lead workflow

Forward-only. Exact statuses:

`submitted` → `contacted` → `proposal_shared` → `confirmed_install` → `payment_done` → `installation_in_progress` → `installation_done`

Rules live in `src/lib/workflow.ts` and are enforced on `PATCH /api/leads/[id]/status`. Every change inserts `status_history`. Skipping a stage returns **409**.

## What creates each status

| To | Trigger |
| --- | --- |
| `submitted` | `POST /api/public/consultations` (calculator or book-consultation form). First history row has `from_status` null. |
| `contacted` | Staff clicks “Mark Contacted” on the lead. After this, staff can generate a BOM estimate. |
| `proposal_shared` | Staff shares a proposal (`POST /api/proposals/[id]/share`) **and** the lead is currently `contacted`; or staff moves status manually if already allowed. Sharing when the lead is still `submitted` does **not** skip `contacted`. Product photos can still be added after share. |
| `confirmed_install` | Staff after the customer agrees. |
| `payment_done` | Staff after payment is recorded (no payment gateway in this app). |
| `installation_in_progress` | Staff when work starts. |
| `installation_done` | Staff when work is complete. Terminal state. |

Staff and admins can see all leads and proposals. Only admins reassign. Status transitions still go through the API. Admins manage BOM prices.

## Emails

| Event | To | Template |
| --- | --- | --- |
| New consultation | Customer `email` if provided | Confirmation (`consultationCustomerEmail`) |
| New consultation | `SALES_NOTIFICATION_EMAIL` (or brand email) | New lead (`consultationSalesEmail`) |
| Proposal shared | Customer `email` if provided | Link to `/p/{shareToken}` (`proposalSharedEmail`) |

If neither `RESEND_API_KEY` nor `BREVO_API_KEY` is set, sends are skipped and logged. Status still changes.

No other automated mail (no payment receipts, no install-complete mail) unless added later and documented here.
