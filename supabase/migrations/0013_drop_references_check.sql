-- Drop the employment-reference verification column. Product decision: reference
-- checks are not a platform feature — contacting prior employers per candidate is
-- too much overhead for the marginal trust. The verification set is now exactly
-- Identity / English / Qualification, and no surface implies references are ever
-- checked. references_checked_at (added in 0008) is no longer read anywhere.
--
-- Idempotent and re-runnable. Destructive only of an unused, always-null column.

alter table applications drop column if exists references_checked_at;
