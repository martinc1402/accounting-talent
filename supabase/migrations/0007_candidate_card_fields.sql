-- Candidate-card fields: the data the employer-facing search card wants but the
-- application form never captured (or captured only as free text).
--
-- This migration is PREPARATION, not backfill. Every column is nullable (or an
-- empty-array default) and nothing populates them yet, so existing rows are
-- untouched and the card renders them with graceful fallbacks (see
-- lib/search/candidate.ts) until a later pass fills these in. Additive and
-- idempotent: `add column if not exists`, safe to re-run.
--
-- Why new columns rather than reusing the existing text fields: the card needs
-- structured values the form stores as prose. experience_years / salary_expectation
-- / working_hours are free text ("3-5 years", "$900-1200/mo", "flexible"), which is
-- fine for a human reviewer but can't be sorted, filtered, or rendered as a clean
-- "$900-$1,200 · USD / month". The numeric/typed columns below sit ALONGSIDE the
-- text ones (the text stays the source of truth until curated), so nothing is lost.

-- Portrait shown at the top of the card. Null => the card draws a silhouette
-- placeholder; a real face is never invented.
alter table applications add column if not exists photo_url text;

-- The card's location reads "City, Country" (e.g. "Ahmedabad, India"). The form
-- captures city + (optional) state, but no country, so add it. Falls back to
-- state, then city alone, when null.
alter table applications add column if not exists country text;

-- Graded English proficiency for the "English: Advanced" verification badge. The
-- pipeline only has a writing pass/fail boolean today, which is not a level, so
-- this is its own field. Null => the badge is omitted, not guessed.
alter table applications add column if not exists english_level text;

-- Identity verification. There is no identity-verification step in the pipeline
-- yet (email_verified_at is dead — verification was de-gated), so the card's
-- "Identity verified" badge has nothing to stand on. This timestamp is that
-- anchor: set it when identity is actually verified. Null => no badge.
alter table applications add column if not exists identity_verified_at timestamptz;

-- Role-specific evidence chips for NON-tax roles (bookkeeper "AP / AR, Bank
-- reconciliations", auditor "SOX testing", controller "Month-end close"). Tax
-- roles already have tax_forms; every other role had no structured column, so
-- the card could only show tax evidence. Empty array => the evidence block is
-- omitted for that candidate.
alter table applications
  add column if not exists role_evidence text[] not null default '{}';

-- Numeric years of experience for the "N years' experience" line, so it sorts and
-- filters. experience_years (text) stays the human answer; this is the curated
-- number. Null => fall back to parsing / showing the text.
alter table applications add column if not exists experience_years_num int;

-- Expected compensation as a clean USD monthly range, for "$900-$1,200 · USD /
-- month". salary_expectation (text) remains the raw answer. Both null => the card
-- falls back to the salary_expectation text, then omits the block.
alter table applications add column if not exists salary_min_usd int;
alter table applications add column if not exists salary_max_usd int;

-- Hours of overlap with the US Eastern workday, for "4 hours ET overlap" /
-- (>= 8) "Full US shift available". working_hours (text) stays the raw answer.
-- Null => fall back to the working_hours text.
alter table applications add column if not exists et_overlap_hours int;
