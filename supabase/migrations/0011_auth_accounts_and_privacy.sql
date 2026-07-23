-- Authorization foundation: platform profiles, employer accounts + memberships,
-- and candidate privacy controls. Companion to the introduction lifecycle in
-- 0012. This is where "who is the viewer" gets a home for the first time.
--
-- Idempotent and re-runnable (paste twice safely): enum creation is guarded, and
-- policies use drop-if-exists + create. RLS stays the project default (deny-all)
-- on candidate data; the only policies added here are auth.uid()-scoped SELECTs
-- on the USER-OWNED account tables, as defense-in-depth. The app still reads
-- everything through the service role behind server-side projections; the browser
-- Supabase client is used only for auth.
--
-- Admin is NOT stored as an editable flag here: it is derived at request time
-- from the verified session email matching SUPER_ADMIN_EMAIL (see lib/authz).
-- platform_role exists to support additional non-bootstrap admins later.

-- Enums (guarded; Postgres has no `create type if not exists`).
do $$ begin
  create type employer_verification_state as enum ('unverified','pending','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employer_plan as enum ('free','paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employer_member_role as enum ('owner','member');
exception when duplicate_object then null; end $$;

-- One row per authenticated user. Mirrors auth.users; created on first sign-in
-- (upserted by the auth callback via the service role).
create table if not exists profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  platform_role text not null default 'user' check (platform_role in ('admin','user')),
  created_at timestamptz not null default now()
);

-- An employer organisation. Verification and plan are INDEPENDENT axes: paying
-- never sets verified, and being verified never sets paid.
create table if not exists employer_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  verification_state employer_verification_state not null default 'unverified',
  plan employer_plan not null default 'free',
  -- Optional per-account entitlement overrides layered over the plan defaults.
  entitlements jsonb,
  verified_at timestamptz,
  plan_updated_at timestamptz
);

-- Membership links a user to an employer account with a role. owner is the only
-- role used today; member is modelled now so it needs no migration later.
create table if not exists employer_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  employer_account_id uuid not null references employer_accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  member_role employer_member_role not null default 'owner',
  unique (employer_account_id, user_id)
);
create index if not exists employer_members_user_idx on employer_members (user_id);

-- Candidate privacy controls (PREPARATION, nullable/defaulted). Defaults chosen
-- per spec: photo private, compensation public, not search-indexed.
alter table applications add column if not exists public_photo boolean not null default false;
alter table applications add column if not exists public_compensation boolean not null default true;
alter table applications add column if not exists allow_search_indexing boolean not null default false;
alter table applications add column if not exists privacy_updated_at timestamptz;

-- RLS. Candidate data (applications, etc.) keeps the project's deny-all posture
-- (no policies added). The user-owned account tables get RLS on plus narrow
-- self-SELECT policies so a signed-in browser client could only ever read its
-- OWN rows. Writes remain service-role only (no insert/update/delete policies).
alter table profiles enable row level security;
alter table employer_accounts enable row level security;
alter table employer_members enable row level security;

drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
  for select using (auth.uid() = user_id);

drop policy if exists employer_members_self_select on employer_members;
create policy employer_members_self_select on employer_members
  for select using (auth.uid() = user_id);

drop policy if exists employer_accounts_member_select on employer_accounts;
create policy employer_accounts_member_select on employer_accounts
  for select using (
    exists (
      select 1 from employer_members m
      where m.employer_account_id = employer_accounts.id
        and m.user_id = auth.uid()
    )
  );
