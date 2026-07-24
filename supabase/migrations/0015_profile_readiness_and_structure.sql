-- Profile readiness + structured, confirmable applicant data. Makes real profiles
-- precise and publication-gated: unconfirmed info stays admin-only, and only
-- `published` profiles are public. Additive, idempotent, re-runnable. Nothing here
-- backfills or invents data — every field is nullable and populated by curation.

-- Publication state machine. Only 'published' is publicly viewable (admins preview
-- any state). Replaces verified_at as the route gate.
alter table applications add column if not exists profile_status text not null default 'draft';
do $$ begin
  alter table applications add constraint applications_profile_status_chk
    check (profile_status in (
      'draft','needs_candidate_confirmation','under_assessment','approved','published','paused'
    ));
exception when duplicate_object then null; end $$;

-- Canonical target role(s). Shown publicly only once role_confirmed_at is set;
-- otherwise the raw free-text role is used and the admin sees a needs-confirm flag.
alter table applications add column if not exists primary_target_role text;
alter table applications add column if not exists alternative_target_roles text[];
alter table applications add column if not exists role_confirmed_at timestamptz;

-- US tax experience. Exact label is computed from a confirmed start date; without
-- confirmation the public label falls back to the free-text range.
alter table applications add column if not exists us_tax_experience_start_date date;
alter table applications add column if not exists us_tax_experience_months int;
alter table applications add column if not exists experience_confirmed_at timestamptz;

-- Compensation basis. salary_min_usd / salary_max_usd (0007) hold the range; these
-- add the basis. The "Based on up to N hours/week" line shows only when confirmed.
alter table applications add column if not exists compensation_currency text default 'USD';
alter table applications add column if not exists compensation_period text default 'month';
alter table applications add column if not exists hours_per_week_basis int;
alter table applications add column if not exists compensation_basis_confirmed_at timestamptz;

-- Structured availability. timezone (0014) holds the IANA zone. ET overlap is
-- computed only when start + finish are known (see lib/overlap.ts).
alter table applications add column if not exists avail_days text[];
alter table applications add column if not exists avail_start_time text;   -- "15:30"
alter table applications add column if not exists avail_finish_time text;  -- "23:30"
alter table applications add column if not exists avail_max_weekly_hours int;
alter table applications add column if not exists avail_busy_season_flexible boolean;
alter table applications add column if not exists availability_structured_confirmed_at timestamptz;

-- Remaining confirmation flags.
alter table applications add column if not exists software_confirmed_at timestamptz;
alter table applications add column if not exists education_confirmed_at timestamptz;
alter table applications add column if not exists candidate_publication_approved_at timestamptz;

-- Proof points (supersedes highlights). jsonb array of
--   { value, label, source_type: 'candidate_provided'|'accounting_talent_verified',
--     display_order, is_public, confirmed_by_candidate_at }
-- Candidate-provided by default; never rendered as verified unless source_type says so.
alter table applications add column if not exists proof_points jsonb;

-- Per-return preparation/review experience. jsonb array of { form, mode }
--   mode: 'prepared' | 'reviewed' | 'both'
alter table applications add column if not exists return_experience jsonb;

-- employment_history (0008), software_proficiency (0008) and education (0008) keep
-- their jsonb columns; the mapper reads richer optional sub-fields (employer_public,
-- source_type, last_used, field_of_study, completion_status, …). No schema change
-- needed for those — jsonb is open.
