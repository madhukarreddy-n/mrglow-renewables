-- Mr.GLOW Renewables — Supabase schema
-- Source of truth for DDL. Run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------- Employees (linked to Supabase Auth users) ----------

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamptz not null default now()
);

-- ---------- Leads ----------

do $$ begin
  create type lead_status as enum (
    'submitted',
    'contacted',
    'proposal_shared',
    'confirmed_install',
    'payment_done',
    'installation_in_progress',
    'installation_done'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  address text,
  city text,
  site_type text check (site_type in ('home', 'commercial', 'industrial')),
  monthly_bill_inr numeric,
  estimated_system_kwp numeric,
  estimated_annual_savings_inr numeric,
  source text not null default 'consultation' check (source in ('calculator', 'consultation', 'manual')),
  status lead_status not null default 'submitted',
  assigned_employee_id uuid references employees(id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leads add column if not exists archived_at timestamptz;
create index if not exists leads_archived_idx on leads(archived_at);

create index if not exists leads_status_idx on leads(status);
create index if not exists leads_assigned_idx on leads(assigned_employee_id);

-- ---------- Proposals ----------

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_by_employee_id uuid not null references employees(id),
  system_size_kwp numeric,
  price_inr numeric not null,
  components jsonb not null default '{}'::jsonb,
  pdf_storage_path text,
  share_token uuid unique default gen_random_uuid(),
  shared_at timestamptz,
  estimate_serial integer,
  estimate_number text unique,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table proposals add column if not exists estimate_serial integer;
alter table proposals add column if not exists estimate_number text;
alter table proposals add column if not exists version integer;
alter table proposals alter column version set default 1;
update proposals set version = 1 where version is null;

create unique index if not exists proposals_estimate_number_idx on proposals(estimate_number);
create index if not exists proposals_lead_idx on proposals(lead_id);

-- ---------- BOM catalogue (admin-managed prices by brand) ----------

create table if not exists bom_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  make text not null,
  unit text not null,
  unit_price numeric,
  gst_pct numeric not null default 18,
  default_qty numeric not null default 1,
  sort_order integer not null default 0,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bom_items_category_idx on bom_items(category, sort_order);

-- ---------- Proposal photos ----------

create table if not exists proposal_photos (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by_employee_id uuid references employees(id),
  uploaded_at timestamptz not null default now()
);

-- ---------- Status history (append-only audit trail) ----------

create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  from_status lead_status,
  to_status lead_status not null,
  changed_by_employee_id uuid references employees(id),
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists status_history_lead_idx on status_history(lead_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at before update on leads
  for each row execute function set_updated_at();

drop trigger if exists proposals_updated_at on proposals;
create trigger proposals_updated_at before update on proposals
  for each row execute function set_updated_at();

drop trigger if exists bom_items_updated_at on bom_items;
create trigger bom_items_updated_at before update on bom_items
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------

alter table employees enable row level security;
alter table leads enable row level security;
alter table proposals enable row level security;
alter table proposal_photos enable row level security;
alter table status_history enable row level security;
alter table bom_items enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from employees
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

create or replace function current_employee_id() returns uuid as $$
  select id from employees where auth_user_id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function is_staff() returns boolean as $$
  select current_employee_id() is not null;
$$ language sql stable security definer set search_path = public;

drop policy if exists employees_admin_all on employees;
create policy employees_admin_all on employees
  for all using (is_admin());
drop policy if exists employees_self_read on employees;
create policy employees_self_read on employees
  for select using (auth_user_id = auth.uid());

drop policy if exists leads_admin_all on leads;
create policy leads_admin_all on leads
  for all using (is_admin());
drop policy if exists leads_employee_assigned on leads;
drop policy if exists leads_employee_update_assigned on leads;
drop policy if exists leads_staff_select on leads;
create policy leads_staff_select on leads
  for select using (is_staff());
drop policy if exists leads_staff_update on leads;
create policy leads_staff_update on leads
  for update using (is_staff());

drop policy if exists proposals_admin_all on proposals;
create policy proposals_admin_all on proposals
  for all using (is_admin());
drop policy if exists proposals_employee_assigned on proposals;
drop policy if exists proposals_staff_all on proposals;
create policy proposals_staff_all on proposals
  for all using (is_staff()) with check (is_staff());

drop policy if exists proposal_photos_admin_all on proposal_photos;
create policy proposal_photos_admin_all on proposal_photos
  for all using (is_admin());
drop policy if exists proposal_photos_employee_assigned on proposal_photos;
drop policy if exists proposal_photos_staff_all on proposal_photos;
create policy proposal_photos_staff_all on proposal_photos
  for all using (is_staff()) with check (is_staff());

drop policy if exists status_history_admin_all on status_history;
create policy status_history_admin_all on status_history
  for all using (is_admin());
drop policy if exists status_history_employee_assigned on status_history;
drop policy if exists status_history_staff_select on status_history;
create policy status_history_staff_select on status_history
  for select using (is_staff());
drop policy if exists status_history_employee_insert on status_history;
drop policy if exists status_history_staff_insert on status_history;
create policy status_history_staff_insert on status_history
  for insert with check (is_staff());

drop policy if exists bom_items_staff_select on bom_items;
create policy bom_items_staff_select on bom_items
  for select using (is_staff());
drop policy if exists bom_items_admin_all on bom_items;
create policy bom_items_admin_all on bom_items
  for all using (is_admin()) with check (is_admin());

-- Private bucket for proposal photos (signed uploads)
insert into storage.buckets (id, name, public)
values ('proposal-photos', 'proposal-photos', false)
on conflict (id) do nothing;

drop policy if exists proposal_photos_storage_select on storage.objects;
create policy proposal_photos_storage_select on storage.objects
  for select using (
    bucket_id = 'proposal-photos'
    and is_staff()
  );

insert into storage.buckets (id, name, public)
values ('proposal-pdfs', 'proposal-pdfs', false)
on conflict (id) do nothing;

drop policy if exists proposal_pdfs_storage_select on storage.objects;
create policy proposal_pdfs_storage_select on storage.objects
  for select using (
    bucket_id = 'proposal-pdfs'
    and is_staff()
  );

-- Public consultation submissions and public proposal-share views use the
-- service role key in API routes (bypasses RLS). Never expose it to the browser.
