-- Stage 2: the skills assessment (writing prompt + 10-question quiz).
--
-- Invitation-only. Rows are created and mutated exclusively by the server (the
-- service-role client); like 0001/0002 every table here has RLS on with no
-- policies, so anon and authenticated requests are denied. Never add a public
-- policy: a token in a URL is the only credential, and it is checked in code.
--
-- Re-runnable: enums are guarded (Postgres has no `create type if not exists`)
-- and every table/column/sequence uses `if not exists`, so pasting the whole
-- file twice is safe.

-- Assessment lifecycle. invited -> started (first page load) -> submitted
-- (applicant done) -> passed | failed (reviewer decision).
do $$ begin
  create type assessment_status as enum (
    'invited',
    'started',
    'submitted',
    'passed',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

-- Why a failed assessment failed, per spec Part 4. Drives which sentence the
-- fail email uses. Null until a reviewer decides.
do $$ begin
  create type assessment_fail_reason as enum (
    'quiz_score',
    'writing_generic',
    'writing_ai_or_copied'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  application_id uuid not null references applications (id),

  -- The only thing standing between a stranger and this row. Unique + indexed
  -- because every page load and submit looks up by it.
  token uuid not null unique default gen_random_uuid(),

  status assessment_status not null default 'invited',
  invited_at timestamptz not null default now(),
  started_at timestamptz,
  submitted_at timestamptz,
  -- invited_at + 7 days, stamped by the invite path.
  expires_at timestamptz not null default (now() + interval '7 days'),
  attempt_number int not null default 1,

  -- The applicant's work.
  writing_sample text,
  quiz_answers jsonb,
  -- Computed server-side on submit against the answer key in
  -- lib/assessment/questions.ts. The key is never stored here or sent to the
  -- browser.
  quiz_score int,
  -- The per-question option shuffle, persisted so a refresh shows the same
  -- order. e.g. { "q1": ["C","A","D","B"], ... } of ORIGINAL option keys in
  -- display order. Reveals nothing: which key is correct lives only in code.
  option_order jsonb,

  -- Reviewer decision.
  writing_pass boolean,
  fail_reason assessment_fail_reason,
  reviewed_at timestamptz,
  reviewed_by text,

  -- One timestamp per outbound email, so "status is invited but
  -- invite_email_sent_at is null" (or submitted-but-no-result) is a queryable
  -- inconsistency rather than an invisible one.
  invite_email_sent_at timestamptz,
  result_email_sent_at timestamptz
);

create index if not exists assessments_token_idx on assessments (token);
create index if not exists assessments_application_idx on assessments (application_id);
create index if not exists assessments_status_idx on assessments (status);
create index if not exists assessments_submitted_at_idx on assessments (submitted_at);

alter table assessments enable row level security;

-- Applicant columns set when an assessment is passed.
alter table applications add column if not exists verified_at timestamptz;
alter table applications add column if not exists assessment_score int;
alter table applications add column if not exists founding_member_number int;

-- Founding member numbers are assigned from a sequence so concurrent passes
-- cannot collide. A wasted value (reserved, then the pass email failed to send)
-- leaves a harmless gap; sequential-with-gaps is fine, duplicates are not.
create sequence if not exists founding_member_seq;

-- The pass path reserves a number BEFORE sending the verified email (the number
-- goes in the email), then commits it only if the send succeeded. Exposed to the
-- server as an RPC; execute is revoked from public and granted only to the
-- service_role the server key uses, so anon/authenticated cannot consume the
-- sequence.
create or replace function reserve_founding_member_number()
returns bigint
language sql
security definer
set search_path = public
as $$ select nextval('founding_member_seq') $$;

revoke all on function reserve_founding_member_number() from public;
grant execute on function reserve_founding_member_number() to service_role;

-- Audit log for every admin-route call (invite / result). detail carries the
-- error text on a failed send, or the override flag on a forced pass.
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,
  application_id uuid,
  assessment_id uuid,
  outcome text,
  detail text,
  actor text
);

create index if not exists admin_actions_created_at_idx on admin_actions (created_at desc);

alter table admin_actions enable row level security;
