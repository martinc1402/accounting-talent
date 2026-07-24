-- Saved candidates (employer shortlist) + candidate availability freshness and
-- timezone. Companion to the authz layer (0011/0012).
--
-- Idempotent and re-runnable. RLS stays the project default (deny-all) on the new
-- table; all writes go through the server actions using the service role.

-- Employer shortlist: one row per (employer account, candidate). The unique
-- constraint makes duplicate saves impossible at the DB layer.
create table if not exists saved_candidates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  employer_account_id uuid not null references employer_accounts (id) on delete cascade,
  application_id uuid not null references applications (id) on delete cascade,
  created_by uuid references auth.users (id),
  unique (employer_account_id, application_id)
);
create index if not exists saved_candidates_account_idx
  on saved_candidates (employer_account_id, created_at desc);

alter table saved_candidates enable row level security;

-- Availability freshness: when the candidate last confirmed they're available.
-- Null => never confirmed (treated as stale). Public copy switches to
-- "Availability being reconfirmed" once older than AVAILABILITY_STALE_DAYS.
alter table applications add column if not exists availability_confirmed_at timestamptz;

-- IANA timezone (e.g. 'Asia/Kolkata'), the structured input for the ET-overlap
-- validation. Null => overlap cannot be validated (display still uses the stored
-- et_overlap_hours; nothing is silently rewritten).
alter table applications add column if not exists timezone text;
