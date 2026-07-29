-- Introduction lifecycle + authorization linkage. Upgrades introduction_requests
-- (0009) from an anonymous concierge note into an account-scoped request with a
-- validated status machine, and adds an append-only status history.
--
-- Idempotent and re-runnable. Status stays `text` (0009 shipped it as text) but
-- gains a guarded check constraint for the new value set; legacy 'new' rows are
-- migrated to 'requested'. RLS stays deny-all on both tables (all access is
-- server-side via the service role behind authorized server actions).

-- Account + actor linkage, priority flag, and decision/expiry timestamps.
alter table introduction_requests
  add column if not exists employer_account_id uuid references employer_accounts (id);
alter table introduction_requests
  add column if not exists created_by uuid references auth.users (id);
alter table introduction_requests
  add column if not exists priority boolean not null default false;
alter table introduction_requests add column if not exists decided_at timestamptz;
alter table introduction_requests add column if not exists expires_at timestamptz;

-- Migrate the legacy default value, then constrain to the new status set.
update introduction_requests set status = 'requested' where status = 'new';
alter table introduction_requests alter column status set default 'requested';

do $$ begin
  alter table introduction_requests add constraint introduction_requests_status_chk
    check (status in (
      'requested','under_review','candidate_invited',
      'accepted','declined','cancelled','expired'
    ));
exception when duplicate_object then null; end $$;

-- One ACTIVE request per employer per candidate, enforced at the DB layer so a
-- race can't create a second. Must stay in sync with ACTIVE_INTRO_STATUSES in
-- lib/authz/introductions.ts. Legacy rows with null employer_account_id are
-- naturally excluded (nulls are distinct in a unique index).
create unique index if not exists introduction_requests_active_uniq
  on introduction_requests (employer_account_id, application_id)
  where status in ('requested','under_review','candidate_invited','accepted');

create index if not exists introduction_requests_account_idx
  on introduction_requests (employer_account_id);

-- Append-only status history: every transition writes one row. RLS deny-all;
-- written only by the server via the service role.
create table if not exists introduction_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  introduction_id uuid not null references introduction_requests (id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_kind text not null default 'system', -- employer | admin | candidate | system
  actor_user_id uuid,
  note text
);
create index if not exists introduction_events_intro_idx
  on introduction_events (introduction_id, created_at);

alter table introduction_events enable row level security;
