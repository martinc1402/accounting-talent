# Admin tasks — Stage 2 assessment

No admin UI in this pass. Review happens in Supabase (see
`supabase/queries/assessment-review.sql`), and the two emails are fired with the
curl one-liners below. Both routes are unlisted, robots-disallowed, rate-limited,
and return **404** to anything without the correct bearer — so a wrong or missing
secret looks exactly like a route that doesn't exist.

## Setup

`ADMIN_TASK_SECRET` must be set (Vercel env in production; `.env.local` locally).
Generate one with:

```bash
openssl rand -hex 32
```

The examples below read it from your shell, so you never paste the secret inline:

```bash
export ADMIN_SECRET='paste-the-secret-here'
export SITE='https://accountingtalent.in'   # or http://localhost:3000 in dev
```

## 1. Send an assessment invite (Email A)

Creates the assessment row + tokenised link and emails it. Needs the applicant's
`applications.id` (find it in the review/queue queries or the applications table).

```bash
curl -sS -X POST "$SITE/api/admin/assessment/invite" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"application_id":"APPLICATION_UUID"}'
```

Refuses (409) if an active, non-expired invite already exists for that applicant.
A retake after a fail/expiry is allowed and bumps `attempt_number`.

## 2. Send a result (Email B pass / Email C fail)

Needs the `assessments.id` (from the review-queue query). The assessment must be
in status `submitted`, or the route refuses (409) — no result-before-submission,
no double-sends.

**Pass:**

```bash
curl -sS -X POST "$SITE/api/admin/assessment/result" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"assessment_id":"ASSESSMENT_UUID","outcome":"passed"}'
```

A pass is refused if `quiz_score < 7`. To force one anyway (logged as an
override in `admin_actions`):

```bash
  -d '{"assessment_id":"ASSESSMENT_UUID","outcome":"passed","override":true}'
```

On pass: reserves the next founding-member number, sends Email B with it, then
stamps `applications.verified_at`, `assessment_score`, `founding_member_number`
and `assessments.status = passed`.

**Fail** — pick one `fail_reason`
(`quiz_score` | `writing_generic` | `writing_ai_or_copied`):

```bash
curl -sS -X POST "$SITE/api/admin/assessment/result" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"assessment_id":"ASSESSMENT_UUID","outcome":"failed","fail_reason":"quiz_score"}'
```

## Ordering guarantee

The email is sent **before** any durable state change. In production, if Resend
is unset or errors, the route returns an error and nothing is stamped (so there
is never a "verified but never told them" applicant). In development, with no
`RESEND_API_KEY`, the email is logged as `[EMAIL-MOCK]` and the flow completes so
you can test it.

Every call is recorded in the `admin_actions` table (action, ids, outcome,
detail) — query it to confirm a send landed or to see why one was refused.

## Bounce tracking (dead email addresses)

There is no email-address verification step, so a bounced Stage 2 invite is how a
dead email surfaces. The Resend webhook records it, so a dead address shows in the
review queue instead of looking like an unresponsive applicant.

**One-time setup:**

1. Run `supabase/migrations/0004_email_bounce.sql` in the Studio SQL editor (adds
   `assessments.email_bounced_at`).
2. Resend dashboard → **Webhooks** → **Add Endpoint**:
   - URL: `https://www.accountingtalent.in/api/webhooks/resend`
   - Events: **`email.bounced`** and **`email.complained`**
3. Copy the webhook's **Signing Secret** (`whsec_...`) into `RESEND_WEBHOOK_SECRET`
   in Vercel (and `.env.local` if testing locally). The route rejects any request
   whose Svix signature doesn't verify, so bounces can't be spoofed.

**How it shows up:** on a bounce/complaint the webhook stamps `email_bounced_at`
on the matching assessment(s) (by recipient address) and logs an
`admin_actions` row (`action = "email_bounce"`). The **Outstanding invites** query
in `supabase/queries/assessment-review.sql` has a `bounced` column — a `true`
there means don't chase that applicant, the address is dead.
