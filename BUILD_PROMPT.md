# Build prompt: Mr.GLOW Renewables platform (single repo, costless stack)

Paste this whole document into Claude Code (or another coding agent) as the
starting instruction. It replaces an earlier AWS-based version of this
prompt — this one runs entirely on free-forever tiers.

---

## 1. What this is

**Mr.GLOW Renewables PVT LTD** installs solar panels for home, commercial,
and industrial customers. Build a single Next.js application containing:

1. The **public marketing site** (existing content/pages, kept as-is) with a
   solar savings calculator and a "Book Consultation" form.
2. An **admin/employee portal** (`/admin`) with role-based logins where staff
   manage leads, build priced proposals, attach installation photos, and move
   each job through a fixed workflow.
3. **Next.js API routes / Server Actions** as the backend — no separate API
   service, no separate infrastructure to run.

Everything runs on services with a permanent free tier: **Vercel**
(hosting, already in place), **Supabase** (Postgres + auth + file storage,
replacing what would otherwise be RDS + Cognito + S3), and **Resend** or
**Brevo** (transactional email, replacing SES). Domain stays on GoDaddy,
already pointed at Vercel.

There is no cloud infrastructure to provision by hand beyond creating free
accounts on Supabase and Resend/Brevo and wiring their API keys into
Vercel's environment variables — no CloudFormation, no containers, no
servers.

---

## 2. Repo layout

```
mrglow-renewables/
├── app/                        # Next.js App Router
│   ├── (public)/                # existing public site pages
│   ├── admin/                   # employee/admin portal (auth-gated)
│   └── api/                     # Route Handlers used as the backend
│       ├── public/consultations/route.ts
│       ├── public/proposals/[shareToken]/route.ts
│       ├── leads/route.ts
│       ├── leads/[id]/route.ts
│       ├── leads/[id]/status/route.ts
│       ├── proposals/route.ts
│       ├── proposals/[id]/route.ts
│       ├── proposals/[id]/share/route.ts
│       └── proposals/[id]/photos/route.ts
├── lib/
│   ├── supabase/                # Supabase client setup (server + browser)
│   ├── email/                   # Resend/Brevo send helpers
│   └── workflow.ts              # status enum + allowed-transition rules
├── supabase/
│   └── schema.sql                # full DB schema + RLS policies (see companion file)
├── .github/workflows/
│   ├── keep-alive.yml            # pings the app every few days so the
│   │                              # Supabase free project never auto-pauses
│   └── ci.yml                    # lint/typecheck/test on PRs (Vercel handles deploys)
├── .env.example
└── README.md
```

No `Dockerfile`, no `docker-compose.yml`, no `infrastructure/` folder — there
is nothing to containerize or provision. Vercel builds and deploys on every
push to `main` automatically, the way it already does today.

---

## 3. Data model (Supabase Postgres)

Use the companion `supabase/schema.sql` file directly — run it once in the
Supabase SQL editor (or via the Supabase CLI migration flow) to create:

- `employees` — linked to Supabase Auth users via `auth_user_id`, with a
  `role` column (`'admin' | 'employee'`)
- `leads` — public form submissions, workflow `status`, `assigned_employee_id`
- `proposals` — pricing, components (jsonb), `share_token` for the public
  read-only view, `shared_at`
- `proposal_photos` — linked to Supabase Storage objects
- `status_history` — append-only audit trail of every workflow transition

**Workflow enum** (exact values, in order):
`submitted → contacted → proposal_shared → confirmed_install → payment_done → installation_in_progress → installation_done`

Every status change writes a row to `status_history` — never overwrite
without logging it.

**Row Level Security**: enable RLS on every table. Employees can only read/
write leads assigned to them unless their role is `admin`, in which case they
see everything. The schema file includes the policies — apply them, don't
disable RLS "to make it easier," even in development.

---

## 4. Auth

Use **Supabase Auth** directly — email/password is enough to start, magic
links are a nice upgrade later. Two roles stored on the `employees` table:
`admin` and `employee`. Middleware on `/admin/*` routes checks for a valid
Supabase session; API route handlers re-check the role server-side before
any mutation (never trust a role claim only checked client-side). Public
site pages have no auth at all.

---

## 5. File storage

Use a **Supabase Storage** bucket (e.g. `proposal-photos`), private by
default. The browser uploads directly to Supabase Storage using a signed
upload URL generated server-side (same pattern as S3 presigned URLs) — the
API route never proxies the actual image bytes.

---

## 6. API endpoints (Next.js Route Handlers)

**Public (no auth):**
- `POST /api/public/consultations` — validates and saves a lead
  (`source='consultation'` or `'calculator'`), status starts at `submitted`,
  sends a confirmation email to the customer and a notification to the sales
  inbox via Resend/Brevo.
- `GET /api/public/proposals/[shareToken]` — customer-facing read-only view
  of a shared proposal (price, system details, photos), no login required.

**Employee/admin (Supabase session required):**
- `GET /api/leads?status=&assignedTo=` — list/filter leads
- `GET /api/leads/[id]` — lead detail + status history + proposals
- `PATCH /api/leads/[id]` — update lead fields, reassign employee
- `PATCH /api/leads/[id]/status` — move to next workflow stage; validate
  allowed transitions server-side, log to `status_history`
- `POST /api/proposals` — create a priced proposal for a lead
- `PATCH /api/proposals/[id]` — edit pricing/components before sharing
- `POST /api/proposals/[id]/share` — generates `share_token`, sets
  `shared_at`, moves lead status to `proposal_shared`, emails the customer
  the shareable link
- `POST /api/proposals/[id]/photos` — records an uploaded photo's storage
  path after a successful signed upload

**Admin-only additions:**
- `POST /api/employees` — invite a new employee (creates a Supabase Auth
  user + `employees` row)
- Role enforcement happens in the route handler, reading the caller's role
  from the `employees` table, not from a client-supplied value.

---

## 7. Frontend

- Keep the existing Next.js public site pages as they are.
- Add `/admin`: login (Supabase Auth UI or a custom form), leads list/kanban
  by workflow status, lead detail page (status timeline, proposal builder,
  photo upload), employee management (admin only).
- Solar calculator stays client-side for the estimate math; its "get my
  full report" / "Book Consultation" actions `POST` to
  `/api/public/consultations`.
- No Dockerfile needed — this deploys to Vercel exactly like the current
  site does.

---

## 8. Keeping Supabase's free project alive

Supabase pauses free-tier projects after 7 days with no API activity. Add
`.github/workflows/keep-alive.yml` (companion file included) — a scheduled
GitHub Action that pings a lightweight health-check endpoint
(`GET /api/health`, which does a trivial `select 1` against Supabase) every
few days. This costs nothing and needs no external cron service.

---

## 9. Environment variables (set in Vercel project settings)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to the client
RESEND_API_KEY=                  # or BREVO_API_KEY
SALES_NOTIFICATION_EMAIL=
```

`.env.example` in the repo should list these names (no values) so setup is
obvious for anyone cloning the project.

---

## 10. Build order

1. `supabase/schema.sql` — create the Supabase project, run the schema, set
   up Storage bucket and RLS policies.
2. `lib/supabase`, `lib/email`, `lib/workflow.ts` — shared helpers.
3. API route handlers — public endpoints first (consultation form needs to
   work end-to-end), then employee-auth-gated endpoints.
4. `/admin` UI — login, leads list, lead detail, proposal builder, photo
   upload.
5. `.github/workflows/keep-alive.yml` and `ci.yml`.
6. Set environment variables in Vercel, verify the deployed site end to end.

No DNS changes are needed — GoDaddy already points at Vercel and nothing
about that changes with this stack.

Ask me before introducing anything that isn't on a permanent free tier
(e.g. a paid Supabase add-on, a third email provider without a forever-free
plan) — default to the leanest, genuinely-costless option described above.
