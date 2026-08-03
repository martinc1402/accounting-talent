-- The employer intake gains "Preferred service": which of the four paths a firm
-- wants (free exploration / Hiring Pass / Curated Shortlist / ongoing hiring).
-- It is the field that routes the lead, it is required in the form, and the
-- pricing CTAs preselect it, so it gets an index for the same reason firm_size
-- got one in 0020.
--
-- Free-text categorical rather than an enum, matching the convention 0006 set for
-- this table: the option list lives in content/passport.ts (serviceOptions) and
-- tunes without a migration. The same array supplies the `service` prop on the
-- lead_submit analytics event, so the dashboard and this column cannot drift.
--
-- NOTE FOR THE NEXT PERSON: experience_required, software[], tax_forms[] and
-- hours_overlap from 0006 are still present and still unwritten by any form. If
-- the intake ever asks those questions again, write to THOSE columns. Do not add
-- duplicates, and do not repurpose one of them to hold something its name does
-- not describe.
--
-- APPLY THIS BEFORE DEPLOYING THE CODE THAT WRITES IT. Migrations in this repo
-- are applied by hand (there is no Supabase CLI config), and Postgres rejects an
-- insert naming an unknown column, so deploying first takes the employer form
-- down for every submit.

alter table employer_leads add column if not exists preferred_service text;

create index if not exists employer_leads_preferred_service_idx
  on employer_leads (preferred_service);

-- RLS stays enabled with zero policies, as 0006 left it and 0020 restated. Every
-- write goes through the service-role client in a Server Action. Do not add a
-- public insert policy.
