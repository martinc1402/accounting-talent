-- Founding members: accountants who applied while the site promised it would
-- always be free for them.
--
-- The 2026-10 pivot made "/" a paid job-search membership. People who signed up
-- under the old "always free" promise keep free access, and this flag is how the
-- product will know who they are once billing exists. It is set by
-- scripts/mark-founding-members.mjs (everyone who applied before 2026-10-03),
-- not by a backfill here, so the cutoff is an explicit, reviewable step rather
-- than a side effect of running a migration.
--
-- Default false: every application created from now on is not a founding member
-- unless someone deliberately marks it. Re-runnable: every statement is
-- idempotent.

alter table applications
  add column if not exists founding_member boolean not null default false;

-- Partial index: the only question asked of this column is "who is a founding
-- member", and that set is small and fixed.
create index if not exists applications_founding_member_idx
  on applications (founding_member) where founding_member;
