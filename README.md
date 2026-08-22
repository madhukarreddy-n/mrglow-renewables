# Mr.GLOW RENEWABLES platform

Production-oriented digital platform for **Mr.GLOW RENEWABLES** (legal name: **Mr.GLOW RENEWABLES PVT LTD**):

public website + solar savings calculator + lead capture + CRM + surveys + quotations + customers + solar plants + generation/savings + service/AMC + admin RBAC.

Verified public contact (also editable in Admin → Settings):

- Email: `mrglowrenewables@gmail.com`
- Website: `www.mrglowrenewables.in`
- Location: Hyderabad
- Phone / WhatsApp: `9912343142`

Do not invent awards, project counts, or testimonials. Publish statistics only after they are entered and `publishStatistics` is enabled.

| Piece | Local | Production |
| --- | --- | --- |
| App | `npm run dev` (Next.js) | Vercel |
| Database | PostgreSQL 16 in Docker | Supabase or AWS RDS |
| Files | `uploads/` | S3 (when configured) |
| Email | skipped / logged if SMTP empty | AWS SES SMTP |

---

## Run locally (Windows) — step by step

This is the same architecture as production: **Next.js + PostgreSQL**.

### 1. Install prerequisites

1. **Node.js 20+** from [nodejs.org](https://nodejs.org) (LTS).
2. **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/). Start it and wait until it is fully running.

Confirm in a **new** PowerShell window:

```powershell
node -v
npm -v
docker --version
docker compose version
```

If `docker` is not recognized (common with a user-level Docker Desktop install), add this folder to your user PATH, then open a new terminal:

```
%USERPROFILE%\AppData\Local\Programs\DockerDesktop\resources\bin
```

Or, for the current PowerShell session only:

```powershell
$env:Path = "$env:USERPROFILE\AppData\Local\Programs\DockerDesktop\resources\bin;" + $env:Path
```

If PowerShell blocks `npm` (`running scripts is disabled`), use `npm.cmd` instead of `npm`:

```powershell
npm.cmd run docker:up
npm.cmd run dev
```

Or allow scripts for your user (one time):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 2. Open the project

```powershell
cd C:\Worspaces\mrglow-renewables
```

### 3. Install npm packages (first time, or after pulling changes)

```powershell
npm install
```

### 4. Create `.env` (first time only)

```powershell
copy .env.example .env
```

Required local values:

```
DATABASE_URL="postgresql://mrglow:mrglow@localhost:5432/mrglow?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@mrglowrenewables.in"
SEED_ADMIN_PASSWORD="ChangeMeNow!2026"
```

Leave `SMTP_*` empty locally. Consultation emails are skipped and logged until SES/SMTP is configured.

### 5. Start PostgreSQL, migrate, and seed (first time, or after a DB reset)

```powershell
npm run setup:local
```

This command:

1. Starts Postgres (`docker compose up -d` — image `postgres:16-alpine`, database `mrglow`, port `5432`)
2. Waits until the database accepts connections (`scripts/wait-postgres.mjs`)
3. Generates the Prisma client
4. Applies migrations (`prisma migrate deploy`)
5. Seeds the admin user, calculator/subsidy config, FAQs, and **demo** CRM rows (`isDemo`)

The first run can take several minutes while Docker pulls the Postgres image.

### 6. Start the website (every day)

See **[Start, stop, and restart](#start-stop-and-restart-local)** below. If Postgres was already migrated and seeded, you do **not** need `setup:local` again.

### 7. Open the product

| What | URL |
| --- | --- |
| Public website | http://localhost:3000 |
| Solar calculator | http://localhost:3000/solar-calculator |
| Book consultation | http://localhost:3000/book-consultation |
| Admin CRM | http://localhost:3000/admin/login |

### 8. Admin login (seed user)

- **Email:** `admin@mrglowrenewables.in`
- **Password:** `ChangeMeNow!2026`

Change this password before any production deploy. Demo records stay in Admin and are not shown as public statistics.

---

## Start, stop, and restart (local)

Run these from the project folder (`C:\Worspaces\mrglow-renewables`). Docker Desktop must be running for Postgres.

On Windows PowerShell, if `npm` fails with “running scripts is disabled”, use `npm.cmd` in place of `npm` in every command below.

### Start

1. Start Postgres (skip if the container is already up):

```powershell
npm.cmd run docker:up
```

2. Start the Next.js app in a terminal you leave open:

```powershell
npm.cmd run dev
```

Wait until the terminal shows `http://localhost:3000`. Then open:

| What | URL |
| --- | --- |
| Public website | http://localhost:3000 |
| Admin CRM | http://localhost:3000/admin/login |

First time only (or after a database reset): `npm.cmd run setup:local` instead of `docker:up`, then `npm.cmd run dev`.

### Stop

1. **Website:** in the terminal running `dev`, press `Ctrl+C`. That stops Next.js only. Postgres keeps running and **keeps its data**.
2. **Database (optional):** stop the Postgres container without deleting data:

```powershell
npm.cmd run docker:down
```

You do not need to stop Docker Desktop unless you want to free RAM.

### Restart

Restart the website after code/env changes, or if the app is stuck:

1. Stop Next.js: `Ctrl+C` in the `dev` terminal.
2. Start it again:

```powershell
npm.cmd run docker:up
npm.cmd run dev
```

`docker:up` is harmless if Postgres is already running. Do **not** re-run `setup:local` on a normal restart.

To restart **Postgres as well** (data volume is kept):

```powershell
npm.cmd run docker:down
npm.cmd run docker:up
npm.cmd run dev
```

### If port 3000 is still in use after stop

Another Node process may still be listening. In PowerShell:

```powershell
netstat -ano | findstr :3000
```

Note the PID on the `LISTENING` row, then:

```powershell
taskkill /PID <pid> /T /F
```

Then `npm.cmd run dev` again.

### npm scripts

| Script | What it does |
| --- | --- |
| `npm run setup:local` | Docker Postgres + wait + migrate + seed |
| `npm run docker:up` | Start Postgres |
| `npm run docker:down` | Stop Postgres (data volume kept) |
| `npm run dev` | Next.js dev server |
| `npm run db:seed` | Re-run seed only |
| `npm run db:studio` | Browse tables |
| `npm run build` | Production build |

---

## Troubleshooting

**`docker` is not recognized**  
Start Docker Desktop, add `resources\bin` to PATH (step 1), open a new terminal.

**`setup:local` waits then fails**  
Wait until Docker Desktop is healthy, then retry.

**Port 5432 already in use**  
Stop the other Postgres instance, or change the host port in `docker-compose.yml` and `DATABASE_URL`.

**Port 3000 already in use**  
Stop the other app, or run `npx next dev -p 3001` and set `NEXT_PUBLIC_APP_URL=http://localhost:3001`.

**Admin 401 / login loop**  
`AUTH_SECRET` must be set. Restart `npm run dev` after changing `.env`.

**Site survey Excel**  
On a lead, open the **Site Survey** tab and download the template (or use the Teams workbook). Headers such as Address, Roof Type, Available Area, Recommended kWp map into the form. Review, then save — the same record feeds the proposal PDF.

**Reset local Postgres (wipes data)**

```powershell
docker compose down -v
npm run setup:local
```

---

## Architecture

| Layer | Location |
| --- | --- |
| Public UI | `src/app/(site)`, `src/components/site` |
| Calculator engine | `src/lib/calculator/engine.ts` (not in React) |
| Config | `src/lib/calculator/resolve.ts` + versioned DB tables |
| API | `src/app/api` |
| Auth + RBAC | `src/lib/auth` (JWT cookie, server-side permissions) |
| CRM / operations | `src/app/admin` |
| PDF | `src/lib/pdf` |
| Email | `src/lib/email/send.ts` (SMTP / AWS SES) |
| Storage | `src/lib/storage` (local now; S3-ready) |
| Database | PostgreSQL via Prisma |

See `docs/ARCHITECTURE.md` and `docs/CALCULATOR.md`.

---

## Production (Vercel + PostgreSQL)

Build does **not** require a live database. Prisma needs `DATABASE_URL` in the schema; if it is unset during `next build`, the app uses a local placeholder and serves default copy. **Runtime** (calculator, leads, admin) needs a real Postgres URL.

### Required Vercel environment variables

Project → Settings → Environment Variables. Apply to **Production** and **Preview**.

| Name | Example |
| --- | --- |
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require` |
| `AUTH_SECRET` | long random string (not the local default) |
| `NEXT_PUBLIC_APP_URL` | `https://www.mrglowrenewables.in` (or the `*.vercel.app` URL until the domain is live) |
| `AUTH_COOKIE_NAME` | `mrglow_session` (optional) |

Also set `SMTP_*` and storage keys before go-live. See `.env.example`.

### Deploy steps

1. Provision Postgres (Supabase, Neon, or AWS RDS). Use SSL in `DATABASE_URL` (`sslmode=require` on Supabase/Neon).
2. Import the GitHub repo in Vercel (framework: Next.js). Region in `vercel.json` is `bom1` (Mumbai).
3. Add the env vars above, then redeploy.
4. Each production build runs `prisma migrate deploy` when `DATABASE_URL` points at a real host.
5. Seed once from a trusted machine (`npx prisma db seed`) against production, then **change the admin password**. Do not seed demo leads as real customers.
6. Attach the GoDaddy domain (below).

Do not run `setup:local` on Vercel.

### GoDaddy DNS → Vercel

1. Vercel → Project → Settings → Domains → add `www.mrglowrenewables.in` and `mrglowrenewables.in`.
2. GoDaddy DNS:
   - Apex: A record to the IP shown in Vercel
   - `www`: CNAME to `cname.vercel-dns.com` (confirm in Vercel)
3. Wait for SSL.
4. Set `NEXT_PUBLIC_APP_URL=https://www.mrglowrenewables.in`.

### AWS (keep it modular)

- RDS PostgreSQL → `DATABASE_URL`
- S3 → `STORAGE_DRIVER=s3` (wire the SDK when the bucket exists)
- SES SMTP → `SMTP_*`
- CloudWatch via platform logs
- Do not add extra Lambdas unless a job needs them

## Security

- `/admin` JWT cookie + middleware
- RBAC on server actions
- Rate limits on login, calculator, consultation
- Honeypot on consultation
- Private uploads
- No secrets in the client bundle

## Branding

Primary source: `MR_Glow_Visual_8_Page_Brochure_PHONE_UPDATED.pdf`  
Truzon PDF is IA inspiration only.

Palette: navy `#0b1f3a`, lime `#7cb342`, gold `#e8b84a`.
