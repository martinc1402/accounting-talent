-- Founding-membership reservations from /get-access ("Reserve a founding
-- membership").
--
-- One row per submission. A job seeker tells us who they are, where they want to
-- work, their role type and experience, and which plan they'd pick. NOTHING IS
-- CHARGED: there is no payment code yet. This is the launch list, and the plan +
-- currency columns are stated intent, not a purchase.
--
-- Same discipline as employer_leads (0006): RLS on with no policies, so every
-- anon/authenticated request is denied, and writes happen only through the
-- reserveMembership server action with the service-role key. Do not add a public
-- insert policy. Categoricals are free text validated in the action against the
-- lists in content/jobs.ts, so options can change without a migration.
--
-- Not deduplicated by email on purpose (a person may come back and change their
-- plan); take the latest row per lower(email) when building the launch list.
-- Re-runnable: every statement is idempotent.

create table if not exists membership_reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null,
  whatsapp text,

  targets text[] not null default '{}',
  role_type text not null,
  experience text not null,

  -- 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'unsure'
  plan text not null,
  -- 'INR' | 'USD': the currency they were shown when they chose.
  currency text not null,

  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists membership_reservations_created_at_idx
  on membership_reservations (created_at desc);
create index if not exists membership_reservations_email_idx
  on membership_reservations (lower(email));

alter table membership_reservations enable row level security;
