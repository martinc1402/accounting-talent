-- Employer role briefs submitted on /employers ("Tell us who you need").
--
-- One row per submission of the concierge matching form: a firm tells us the
-- role, software, experience, schedule and budget, and we come back with a
-- shortlist. This is the primary conversion on the employer page, replacing the
-- old founding-firm waitlist model. firm_waitlist (email-only) stays in place
-- but is no longer the main path.
--
-- Like every other table here, RLS is on with no policies: every anon and
-- authenticated request is denied, and writes happen only through the
-- submitEmployerLead server action using the service-role key (which bypasses
-- RLS). Do not add a public insert policy: it would let anyone spam the table
-- straight from the browser. Re-runnable: every statement is idempotent.

create table if not exists employer_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Who is asking.
  full_name text not null,
  work_email text not null,
  firm_name text not null,
  firm_website text,

  -- What they need. Free-text categoricals (not enums) so the options can be
  -- tuned in content without a migration; software and tax_forms are arrays
  -- because a brief can name several.
  role text not null,
  experience_required text,
  software text[] not null default '{}',
  tax_forms text[] not null default '{}',
  hours_overlap text,
  budget text,
  start_timeframe text,
  details text,

  -- Attribution, mirrored from applications.
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists employer_leads_created_at_idx
  on employer_leads (created_at desc);
create index if not exists employer_leads_email_idx
  on employer_leads (work_email);

alter table employer_leads enable row level security;
