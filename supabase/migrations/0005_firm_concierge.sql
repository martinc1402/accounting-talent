-- Founding-firm concierge answers, captured on /employers right after a firm
-- submits its work email. Two optional single-select questions that feed the
-- hand-match pipeline: which role they'd hire first, and when.
--
-- Both nullable: a firm can skip either question (or both) and still be on the
-- list. Written server-side only by saveFirmConcierge (app/actions.ts) via the
-- service-role key, keyed on the email the join step already stored. RLS stays
-- on firm_waitlist with no policies, so there is no public write path here
-- either.

alter table firm_waitlist add column if not exists first_role text;
alter table firm_waitlist add column if not exists hire_timing text;
