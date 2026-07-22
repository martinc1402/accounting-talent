-- Candidate PROFILE-page fields: the richer data the full profile page shows
-- but the application form never captured. Companion to 0007 (which backed the
-- search card); this backs the /candidates/[id] profile.
--
-- PREPARATION, not backfill. Every column is nullable and nothing populates them
-- yet, so existing rows are untouched and each profile section renders only when
-- its source is present (see lib/profile/candidate.ts). Additive and idempotent:
-- `add column if not exists`, safe to re-run.
--
-- The structured lists (employment history, education, per-tool software) are
-- jsonb rather than side tables: they are display-only, always read whole with
-- the parent row, and never queried across candidates, so a column of shaped
-- JSON is the right weight. A curation tool (not this migration) will fill them.

-- Editorial third-person summary at the top of the profile ("Arjun is a US tax
-- preparer with four busy seasons..."). Distinct from the candidate's own words,
-- which come from assessments.writing_sample. Null => the summary card is omitted.
alter table applications add column if not exists professional_summary text;

-- Employment history timeline. jsonb array of
--   { title, employer, dates, bullets: string[], exposure }
-- Null / empty => the Employment history section is omitted.
alter table applications add column if not exists employment_history jsonb;

-- Education & credentials. jsonb array of
--   { qualification, institution, year, status, completed: bool, note }
-- Falls back to the single free-text `qualification` when null, then omits.
alter table applications add column if not exists education jsonb;

-- Work-preference fields the form does not capture as clean values. `availability`,
-- `working_hours`, `start_date` (text) already exist and stay the source for the
-- rest of the preferences grid.
alter table applications add column if not exists employment_type text; -- e.g. "Full-time"
alter table applications add column if not exists engagement text;      -- e.g. "Employer of record / contractor"
alter table applications add column if not exists willing_full_shift boolean;

-- Per-tool software proficiency for the "Advanced · 3 yrs" meta on the software
-- chips. jsonb array of { name, level, years }. `accounting_software` /
-- `tax_software` (text[]) stay the name source; this only adds optional meta.
-- Null => chips render as plain names.
alter table applications add column if not exists software_proficiency jsonb;

-- Verification timestamps backing the two "Verified by AccountingTalent" rows the
-- pipeline doesn't produce yet (identity_verified_at + english_level came in 0007;
-- the assessment row stays hidden behind SHOW_ASSESSMENT). Null => that row omitted.
alter table applications add column if not exists qualification_verified_at timestamptz;
alter table applications add column if not exists references_checked_at timestamptz;
