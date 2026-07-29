-- Dashboard lifecycle pass: candidate change requests + a published-at stamp.
-- Additive, idempotent, re-runnable. Nothing backfills existing rows.

-- When a profile last went live. Powers the dashboard "Live — visible since <date>"
-- headline; stamped by candidateSetPublished / adminSetProfileStatus on publish.
alter table applications add column if not exists published_at timestamptz;

-- Candidate-initiated change requests for AT-maintained / confirm-only fields
-- (professional summary, employment history, compensation, target role, etc.).
-- Persisted + auditable so a future admin review queue can subscribe. Not a
-- workflow engine — 'open' until an admin resolves it out of band.
create table if not exists profile_change_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  section text not null,
  requested_value text,
  note text,
  status text not null default 'open',
  actor text,
  created_at timestamptz not null default now()
);

do $$ begin
  alter table profile_change_requests add constraint profile_change_requests_status_chk
    check (status in ('open','resolved','declined'));
exception when duplicate_object then null; end $$;

-- Dashboard reads open requests per candidate; admin queue reads by status.
create index if not exists profile_change_requests_application_idx
  on profile_change_requests (application_id, status);
create index if not exists profile_change_requests_open_idx
  on profile_change_requests (status, created_at desc);
