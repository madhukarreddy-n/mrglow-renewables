# HTTP APIs

- Public: `/api/calculator`, `/api/consultation`, calculator PDF by share token. Rate-limit + validate with Zod. Consultation honeypot field `company`.
- Admin: `/api/admin/*` always `requireApiPermission`. Designs: images only, size cap, keys under `designs/{leadId}/`.
- Files: `/api/files/[...key]` — authenticated, reject `..`, no public listing.
- Do not add unauthenticated admin JSON. Do not return other leads’ files by guessing keys without a lead-scoped query.
