# Runbook

## First admin (recommended)

1. Apply `schema.sql` in the Supabase SQL editor.
2. Put project URL, anon key, and service role in `.env.local`.
3. Open http://localhost:3000/admin/login — if there are no employees, the **Create first admin** form appears.
4. Submit name, email, password. That creates the Auth user (email already confirmed) and an `employees` row with `role = admin`.
5. You are signed in and sent to `/admin`.

Optional: set `SETUP_SECRET` in `.env.local` / Vercel so strangers cannot claim the first admin on a live empty database.

## First admin (SQL, if the form is not used)

Passwords are **not** stored on `employees`. Login uses **Supabase Auth** (`auth.users`). The SQL row only links that Auth user to a staff role.

1. Supabase → **Authentication → Users → Add user**.
2. Enter email **and password** there (this is the login password). Auto-confirm the email if the dashboard offers it.
3. Open the user and copy **User UID** (UUID).
4. SQL editor — password is **not** a column:

```sql
insert into employees (auth_user_id, name, email, role)
values (
  'PASTE_AUTH_USER_UUID_HERE',
  'Admin',
  'you@example.com',  -- same email as the Auth user
  'admin'
);
```

5. Sign in at `/admin/login` with that **email + the password you set in Authentication**, not something from this INSERT.

The staff sign-in form always requires a password (`type="password"` + `required`). If you only ran the INSERT and never created an Auth user with a password, login cannot work.

## Auth URL

Supabase → Authentication → URL configuration:

- Site URL: `http://localhost:3000` while developing; production `https://www.mrglowrenewables.in`
- Redirect URLs: the same origins (and `http://localhost:3000/**` if prompted)

## Signed in but not on the staff list

The Auth user exists but `employees.auth_user_id` does not match. Sign out, run setup if the table is empty, or insert the SQL row above.

## Supabase project paused (free tier)

Symptoms: `/api/health` is 503; login fails; consult form cannot save.

1. Open [Supabase dashboard](https://supabase.com/dashboard) → the project → **Restore** / un-pause.
2. Confirm `GET /api/health` returns `{ "ok": true }`.
3. GitHub Action `Keep Supabase alive` should ping that URL. Set repo secret `APP_URL` to the public origin (no trailing slash).

## Rotate Supabase keys

1. Supabase → Project Settings → API: rotate anon and/or service role.
2. Update `.env.local` and Vercel env (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Redeploy.

Never commit keys. Never put the service role in `NEXT_PUBLIC_*`.

## Email not sending (Resend / Brevo)

Leads still save. Logs: `[email:resend]`, `[email:brevo]`, or `[email:skipped]`.

- **Skipped:** set `RESEND_API_KEY` or `BREVO_API_KEY` and redeploy.
- **Resend 403 / domain:** verify the From domain, or set `EMAIL_FROM` to a verified sender.
- **Brevo 401:** regenerate the API key (`BREVO_API_KEY`).
- Confirm `SALES_NOTIFICATION_EMAIL`.

## Proposal photos fail to upload

1. Bucket `proposal-photos` exists and is private (`schema.sql`).
2. Re-apply the latest `schema.sql` so staff-wide storage select policies exist.

## BOM or PDF APIs return missing-table / 500

Re-run **`schema.sql`** in the Supabase SQL editor (safe to re-run). Then as admin open **BOM** and click **Load 3kW BOM catalogue**. Bucket `proposal-pdfs` is created by the same SQL.

## Staff can log in but see no leads

They are looking at a status filter with no rows, or schema is old. After the 2026-09-13 SQL, employees see all leads. Assignment is still used for ownership.

## Archive / delete lead fails

Re-run `schema.sql` so `leads.archived_at` exists. Delete removes Storage objects under `proposal-pdfs/{leadId}` and `proposal-photos/{proposalId}`.

## Vercel cannot talk to Supabase

Copy all env vars to Production and Preview. `NEXT_PUBLIC_APP_URL` must be the public https origin.
