# Architecture

```
Browser
  Public site + calculator wizard
  Admin CRM (RBAC)
       │
       ▼
Next.js (Vercel)
  App Router pages
  Route handlers / server actions
  Calculator engine (lib)
  PDF renderer
  Email adapter
  Storage adapter
       │
       ▼
PostgreSQL (Supabase | RDS | Docker)
Object storage (local uploads | S3)
SMTP (SES)
```

Future: `/customer` portal, inverter `monitoring_provider` + `external_plant_id` on `SolarPlant`, WhatsApp Business API using the same configured number field.
