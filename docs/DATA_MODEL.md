# Data model

DDL source of truth: **`schema.sql`** (identical copy: `supabase/schema.sql`). Apply it in the Supabase SQL editor. This document is the plain-English map; if they disagree, fix this file to match the SQL.

## Tables

### `employees`

Staff who can sign in. `auth_user_id` points at `auth.users`. `role` is `admin` or `employee`. Admins see every lead; every signed-in staff member can read all leads and proposals (assignment is still used for ownership, not visibility).

### `leads`

A person who asked for a consultation or calculator follow-up. Holds name, phone, optional email/address/city, `site_type` (`home` | `commercial` | `industrial`), bill and calculator estimates, `source` (`calculator` | `consultation` | `manual`), workflow `status`, optional `assigned_employee_id`, and `archived_at` (null = active). Archive hides the lead; delete removes the row and storage files.

### `proposals`

A priced offer for one lead. `components` stores a BOM snapshot (`lines`, optional `notes`, `estimate_number`). `estimate_number` looks like `EST-001-V1` (serial per lead family, version on each new save). `share_token` is created with the row. `shared_at` is set when staff share it; the public page only shows rows with `shared_at` set. `pdf_storage_path` is `{leadId}/{proposalId}.pdf` in `proposal-pdfs` and is overwritten on each generate.

### `bom_items`

Catalogue of materials: category, description, make/brand, unit, `unit_price` (nullable until priced), `gst_pct` (5% modules/inverters, 18% otherwise unless overridden), default qty. All staff can read; only admins write. Seed from `src/content/bom-seed.json`.

### `proposal_photos`

Metadata for objects in the private Storage bucket `proposal-photos`. `storage_path` is the object key. Bytes never go through the Next.js API; the API only issues a signed upload URL and then stores the path.

### `status_history`

Append-only log of workflow moves. `from_status` may be null on the first insert (`submitted`).

## Relationships

- `leads.assigned_employee_id` → `employees.id`
- `proposals.lead_id` → `leads.id` (cascade delete)
- `proposals.created_by_employee_id` → `employees.id`
- `proposal_photos.proposal_id` → `proposals.id` (cascade delete)
- `status_history.lead_id` → `leads.id` (cascade delete)
- Proposal line items snapshot brands from `bom_items` at save time; later catalogue price edits do not rewrite old estimates.

## Security

Row Level Security is on for every table. Public consult and public proposal reads use the **service role** in Route Handlers (bypasses RLS). The anon key is used with the logged-in staff session so RLS applies in `/api/leads` and `/api/proposals`.

Helpers in SQL: `is_admin()`, `is_staff()`, `current_employee_id()`.

## Enums

`lead_status`: `submitted`, `contacted`, `proposal_shared`, `confirmed_install`, `payment_done`, `installation_in_progress`, `installation_done`.
