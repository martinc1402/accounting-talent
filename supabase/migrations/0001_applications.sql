-- Stage 1 applications and the employer waitlist.
--
-- Both tables have RLS on with no policies, which denies every anon and
-- authenticated request. Writes happen exclusively through the server actions
-- using the service role key, which bypasses RLS. Do not add a public insert
-- policy: it would let anyone spam the table straight from the browser.

-- Guarded, unlike a bare `create type`. Postgres has no `create type if not
-- exists`, and a pasted script runs as one transaction: a second run would fail
-- here and roll back the WHOLE file, which looks like "the migration did
-- nothing" rather than "it already ran". Every create below is idempotent, so
-- this one is too, and the file can be re-run safely.
do $$ begin
  create type application_tier as enum (
    'fast_track',
    'standard',
    'waitlist',
    'filter_out'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Section A. Identity and contact.
  full_name text not null,
  email text not null,
  whatsapp text not null,
  city text not null,
  state text,
  linkedin text,

  -- Section B. Qualification and experience.
  qualification text not null,
  experience_years text not null,
  us_experience text not null,
  us_experience_setting text,

  -- Section C. Role and skills. These become the employer search filters.
  role text not null,
  accounting_software text[] not null default '{}',
  tax_software text[] not null default '{}',
  tax_forms text[] not null default '{}',

  -- Section D. Availability and expectations.
  salary_expectation text not null,
  availability text not null,
  working_hours text not null,
  start_date text not null,
  home_setup text[] not null default '{}',

  -- Section E. Source tracking and consent.
  source text not null,
  referrer text,
  consent boolean not null default false,

  -- Derived at submission time by lib/scoring.ts.
  tier application_tier not null,

  -- Stage 2 pipeline. Unverified applications are never reviewed, and the spec
  -- expects 30-40% of rows to die here. That is the filter working.
  email_verified_at timestamptz,
  verification_token uuid not null default gen_random_uuid(),

  -- Attribution. Populated from UTM params on /apply.
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Duplicate WhatsApp numbers are a filter_out condition in the spec, so make
-- them cheap to find. Not a unique constraint: a genuine re-application should
-- be reviewable rather than rejected at the database layer.
create index if not exists applications_whatsapp_idx on applications (whatsapp);
create index if not exists applications_email_idx on applications (email);
create index if not exists applications_tier_idx on applications (tier);
create index if not exists applications_created_at_idx on applications (created_at desc);

alter table applications enable row level security;

-- Employer demand validation. One row per firm email.
create table if not exists firm_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique
);

alter table firm_waitlist enable row level security;
