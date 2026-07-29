-- Current career level, separate from the employer-facing target role. Lets the
-- public primary role be aspirational/role-market-facing (e.g. "Senior US Tax
-- Reviewer") while retaining the candidate's actual current seniority (e.g.
-- "Assistant Manager") as structured data. Additive, nullable, re-runnable.
alter table applications add column if not exists current_seniority text;
