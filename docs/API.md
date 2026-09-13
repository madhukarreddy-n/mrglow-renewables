# API

Base URL: the Next.js origin (local `http://localhost:3000`). JSON request and response bodies unless noted.

Auth: **none** for public routes. Staff routes need a Supabase cookie session (email/password via `/admin/login`). Role is read from `employees`, never from a client-supplied field.

## Public

### `GET /api/health`

Auth: none. Uses the service role to ping Postgres (`employees` count head request).

- **200** `{ "ok": true }`
- **503** `{ "ok": false, "error": string }`

### `GET /api/setup`

Auth: none. `{ "needsSetup": true }` when `employees` is empty.

### `POST /api/setup`

Creates the first admin (Auth user + `employees` row). Disabled once any employee exists.

**Request** `{ "name", "email", "password", "setup_secret?" }`

If `SETUP_SECRET` is set in env, `setup_secret` must match.

- **200** `{ "ok": true }`
- **409** already set up

### `GET /api/me`

Staff session. `{ "employee": { "id", "auth_user_id", "name", "email", "phone", "role" } }`

### `POST /api/public/consultations`

Auth: none. Rate-limited by IP. Honeypot: if `company` is non-empty, returns `{ "ok": true }` without inserting.

**Request**

```json
{
  "name": "string (2–80)",
  "phone": "10 digits",
  "email": "optional email",
  "city": "optional",
  "address": "optional",
  "site_type": "home | commercial | industrial",
  "monthly_bill_inr": 5000,
  "estimated_system_kwp": 4.2,
  "estimated_annual_savings_inr": 23000,
  "source": "calculator | consultation | manual",
  "company": "honeypot, omit",
  "message": "optional, stored on first status_history note"
}
```

Creates `leads` with `status: submitted` and a `status_history` row. Emails the customer (if email given) and `SALES_NOTIFICATION_EMAIL`.

- **200** `{ "ok": true, "id": "uuid" }`
- **400** `{ "error": string }`
- **429** `{ "error": string }`
- **500** `{ "error": string }`

### `GET /api/public/proposals/[shareToken]`

Auth: none. Service role. Only rows with `shared_at` set.

- **200** `{ "proposal": { "id", "system_size_kwp", "price_inr", "components", "shared_at" }, "lead": { "name", "city", "site_type" }, "photos": [{ "id", "caption", "url" }] }`
- **404** `{ "error": "Proposal not found" }`

`url` on photos is a time-limited signed Storage URL.

## Staff (session required)

### `GET /api/leads?status=&assignedTo=&archived=1`

Default omits archived leads. `archived=1` returns only archived rows.

- **200** `{ "leads": Lead[] }`
- **401 / 403** `{ "error": "Unauthorized" | "Forbidden" }`

### `GET /api/leads/[id]`

- **200** `{ "lead": Lead, "history": StatusHistory[], "proposals": Proposal[] }`
- **404** `{ "error": "Not found" }`

### `PATCH /api/leads/[id]`

Body: any subset of `name`, `phone`, `email`, `address`, `city`, `site_type`, `monthly_bill_inr`, `estimated_system_kwp`, `estimated_annual_savings_inr`, `assigned_employee_id` (admin), `archived` (boolean; sets or clears `archived_at`).

- **200** `{ "lead": Lead }`

### `DELETE /api/leads/[id]`

Staff. Removes proposal PDFs (`proposal-pdfs/{leadId}/`) and product photos (`proposal-photos/{proposalId}/`), then deletes the lead (cascade proposals, photos metadata, history).

- **200** `{ "ok": true }`

### `PATCH /api/leads/[id]/status`

**Request** `{ "status": "contacted", "note": "optional" }`

Server checks `canTransition`. Writes `status_history`.

- **200** `{ "ok": true, "status": "contacted" }`
- **409** `{ "error": "Cannot move from … to …" }`

### `POST /api/proposals`

**Request** `{ "lead_id": "uuid", "lines": ProposalLine[], "notes?", "system_size_kwp?", "price_inr?" }`

Lead must already be **contacted** (or later). `price_inr` defaults to BOM totals with GST. Assigns `EST-00N-VN` on the lead.

- **201** `{ "proposal": Proposal }`
- **409** `{ "error": "Contact the customer first…" }`

### `GET /api/proposals`

- **200** `{ "proposals": Proposal[] }` (includes nested `leads`)

### `GET /api/proposals/[id]`

- **200** `{ "proposal": Proposal, "photos": ProposalPhoto[] }`

### `PATCH /api/proposals/[id]`

### `PATCH /api/proposals/[id]`

Body: `price_inr`, `system_size_kwp`, `components`, `pdf_storage_path`. If `shared_at` is set, only `pdf_storage_path` may change. Photos stay allowed via the photos route.

- **200** `{ "proposal": Proposal }`
- **409** `{ "error": "Shared proposals cannot change price or BOM…" }`

### `GET /api/proposals/[id]/pdf`

Staff session. Builds a Mr.GLOW RENEWABLES multi-page proposal PDF, stores it on `proposal-pdfs` at `{leadId}/{proposalId}.pdf` (**upsert / overwrite** so dated copies are not kept). Download name is `{leadName}_{yyyy-MM-dd_HH-mm}.pdf` (Asia/Kolkata). `?download=1` for attachment. Does not copy sample-PDF street, bank, award or testimonial claims.

### `POST /api/proposals/[id]/share`

Sets `shared_at`. If the lead can move from current status to `proposal_shared`, it does so and logs history. Emails the customer when `leads.email` is set. Link: `{NEXT_PUBLIC_APP_URL}/p/{share_token}`.

- **200** `{ "ok": true, "url": "https://…/p/…", "share_token": "uuid" }`

### `POST /api/proposals/[id]/photos`

Two shapes:

1. Sign: `{ "intent": "sign", "filename": "roof.jpg" }` → `{ "storage_path", "token", "signedUrl", "path" }`
2. Record: `{ "storage_path": "{proposalId}/…", "caption": "optional" }` → **201** `{ "photo": ProposalPhoto }`

`storage_path` must start with `{proposalId}/`. Allowed after the proposal is shared.

### `GET /api/bom`

Staff. `{ "items": BomItem[] }`

### `POST /api/bom`

Admin. Create catalogue row.

### `PATCH /api/bom/[id]`

Admin. Update price, GST, make, active flag, etc.

### `DELETE /api/bom/[id]`

Admin. Soft-delete (`active: false`).

### `POST /api/bom/seed`

Admin. Inserts `src/content/bom-seed.json` only when `bom_items` is empty.

## Admin only

### `GET /api/employees`

- **200** `{ "employees": Employee[] }`

### `POST /api/employees`

Creates a Supabase Auth user (email confirmed) and an `employees` row. Rolls back the Auth user if the row insert fails.

**Request** `{ "name", "email", "phone?", "role": "admin" | "employee", "password": "min 8 chars" }`

- **201** `{ "employee": Employee }`
