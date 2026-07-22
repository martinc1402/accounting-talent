-- Introduction requests: a firm asking to be introduced to a verified candidate
-- from the profile page's "Request introduction" modal.
--
-- Same discipline as employer_leads (0006) and every other table here: RLS on
-- with no policies, so anon and authenticated requests are denied; writes happen
-- only through the requestIntroduction server action using the service-role key
-- (which bypasses RLS). Do not add a public insert policy: it would let anyone
-- spam the table straight from the browser. Re-runnable: idempotent.
--
-- There is no employer auth yet, so the request records the candidate and an
-- optional message; requester_email / firm_name are nullable now and become the
-- attribution once firms sign in. `status` tracks the concierge follow-up.

create table if not exists introduction_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  application_id uuid not null references applications (id),
  message text,

  -- Nullable until employer accounts exist; the modal collects only a message.
  requester_email text,
  firm_name text,

  status text not null default 'new'
);

create index if not exists introduction_requests_application_idx
  on introduction_requests (application_id);
create index if not exists introduction_requests_created_at_idx
  on introduction_requests (created_at desc);

alter table introduction_requests enable row level security;
