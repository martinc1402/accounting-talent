-- Stage 2 review operations (Part 5 of the assessment spec).
--
-- No admin UI in this pass: review happens by running these in the Supabase SQL
-- editor. Paste one at a time. None of these mutate data; the pass/fail decision
-- is applied by calling the /api/admin/assessment/result route (see
-- docs/admin-tasks.md), never by editing rows here.

-- ---------------------------------------------------------------------------
-- 1. REVIEW QUEUE
-- Submitted assessments awaiting a decision, oldest first (the 3-day SLA clock
-- starts at submitted_at). Everything a reviewer needs on one row.
-- ---------------------------------------------------------------------------
select
  a.id                as assessment_id,
  a.submitted_at,
  now() - a.submitted_at as waiting,
  a.attempt_number,
  ap.full_name,
  ap.email,
  ap.tier             as stage1_segment,
  a.quiz_score,
  a.writing_sample,
  a.email_bounced_at  -- non-null: the invite bounced (dead address)
from assessments a
join applications ap on ap.id = a.application_id
where a.status = 'submitted'
order by a.submitted_at asc;

-- ---------------------------------------------------------------------------
-- 1b. OUTSTANDING INVITES  (invited/started, not yet submitted, not expired)
-- Who was invited but hasn't completed the assessment. `bounced` distinguishes
-- a dead email address (the invite hard-bounced, recorded by the Resend webhook)
-- from someone who simply hasn't done it yet — so a dead email is not chased as
-- an unresponsive applicant.
-- ---------------------------------------------------------------------------
select
  a.id                as assessment_id,
  a.status,
  a.invited_at,
  a.expires_at,
  ap.full_name,
  ap.email,
  a.email_bounced_at,
  (a.email_bounced_at is not null) as bounced
from assessments a
join applications ap on ap.id = a.application_id
where a.status in ('invited', 'started')
  and a.expires_at > now()
order by a.email_bounced_at nulls last, a.invited_at asc;

-- ---------------------------------------------------------------------------
-- 2. DUPLICATE CHECK  (run before passing anyone)
-- WhatsApp answer-sharing means writing samples get copied. This flags a
-- candidate whose sample contains, or is contained by, any OTHER candidate's
-- sample (exact substring match, case-insensitive). Flag both parties.
--
-- Replace :assessment_id with the row you are reviewing. A later upgrade is
-- trigram / pg_trgm similarity for near-matches; exact substring is enough for
-- v1 and catches verbatim copy-paste.
-- ---------------------------------------------------------------------------
with target as (
  select id, writing_sample
  from assessments
  where id = :'assessment_id'
)
select
  other.id            as other_assessment_id,
  other_ap.full_name,
  other_ap.email,
  other.submitted_at,
  other.status
from assessments other
join applications other_ap on other_ap.id = other.application_id,
     target
where other.id <> target.id
  and other.writing_sample is not null
  and length(trim(target.writing_sample)) > 0
  and (
    lower(other.writing_sample) like '%' || lower(target.writing_sample) || '%'
    or lower(target.writing_sample) like '%' || lower(other.writing_sample) || '%'
  )
order by other.submitted_at asc;

-- ---------------------------------------------------------------------------
-- 3. CALIBRATION  (weekly)
-- Pass rate by Stage-1 routing segment. Per Part 3: fast-track should pass at
-- 70-85%; if they fail in bulk the quiz is miscalibrated, and if Tally-only
-- (waitlist) applicants pass in bulk you have a leak.
-- ---------------------------------------------------------------------------
select
  date_trunc('week', a.submitted_at)::date as week,
  ap.tier                                  as stage1_segment,
  count(*)                                 as decided,
  count(*) filter (where a.status = 'passed') as passed,
  round(
    100.0 * count(*) filter (where a.status = 'passed') / nullif(count(*), 0),
    1
  )                                        as pass_rate_pct
from assessments a
join applications ap on ap.id = a.application_id
where a.status in ('passed', 'failed')
group by 1, 2
order by 1 desc, 2;
