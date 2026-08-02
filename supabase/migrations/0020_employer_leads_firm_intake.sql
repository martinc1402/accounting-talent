-- The employer intake form moved from a concierge role brief ("tell us the one
-- role you're hiring for, we'll shortlist within 72 hours") to a founding-access
-- reservation for the database model. The questions changed with it: a firm now
-- tells us how big it is, which roles it would hire (plural), and how many hires
-- it expects over the next year.
--
-- Free-text categoricals rather than enums, matching the convention 0006 set for
-- this table: the option lists live in content/firms.ts and should be tunable
-- without a migration.

alter table employer_leads add column if not exists firm_size text;
alter table employer_leads add column if not exists hires_12mo text;
alter table employer_leads
  add column if not exists roles text[] not null default '{}';

-- `role` was not-null when the form captured exactly one. It is now the plural
-- `roles` that the form writes and that anyone querying should read. `role` is
-- kept, nullable, and still populated with the first selection, so existing rows
-- stay valid and any ad-hoc query or export written against it keeps working.
alter table employer_leads alter column role drop not null;

-- Firm size is the field the smoke test is actually segmenting on (the brief
-- targets 5 to 50 staff), so it gets an index. The others are read in full-table
-- exports where a scan is fine.
create index if not exists employer_leads_firm_size_idx
  on employer_leads (firm_size);

-- RLS stays enabled with zero policies, as 0006 left it. Every write goes
-- through the service-role client in a Server Function. Do not add a public
-- insert policy.
