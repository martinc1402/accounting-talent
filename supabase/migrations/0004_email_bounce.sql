-- Bounce visibility for Stage 2 invites.
--
-- There is no email-address verification step, so a Stage 2 assessment invite is
-- the de-facto dead-email detector: if the invite bounces, the address is dead
-- and the applicant should not read as "unresponsive" in the review queue.
--
-- Stamped by the Resend webhook (app/api/webhooks/resend/route.ts) on an
-- email.bounced or email.complained event, matched by recipient address. Null
-- means no bounce recorded.

alter table assessments add column if not exists email_bounced_at timestamptz;
