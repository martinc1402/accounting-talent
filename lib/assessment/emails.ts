import "server-only";

/*
  The three Stage 2 emails, verbatim from spec Part 4. Plain text on purpose: the
  spec is explicit that "trust reads better than HTML gloss for this audience."

  The transport (sendEmail, the dev [EMAIL-MOCK] behaviour, from/reply-to) moved
  to lib/email.ts once auth started sending its own mail. It is re-exported here
  so existing call sites keep importing it from where they always have.
*/

import type { Composed } from "@/lib/email";

export { sendEmail, resendConfigured } from "@/lib/email";
export type { Composed, SendResult } from "@/lib/email";

// Applicant's first name for the greeting, falling back to a friendly default.
// Shared by the Stage 1 confirmation and the Stage 2 assessment emails.
export function firstNameOf(fullName: string | null | undefined): string {
  const first = (fullName ?? "").trim().split(/\s+/)[0];
  return first || "there";
}

// ---- Stage 1: application received ---------------------------------------
// Sent best-effort the moment an application is saved (see app/actions.ts).
// Honest and low-promise on purpose: it acknowledges receipt without implying a
// job exists or that everyone advances to the assessment.
export function emailApplicationReceived(vars: { first_name: string }): Composed {
  return {
    subject: "We've got your AccountingTalent.in application",
    text: `Hi ${vars.first_name},

Thanks for applying to AccountingTalent.in — your application is in.

What happens next: we review applications over the next few days. Shortlisted applicants get a short skills assessment by email — a writing prompt plus a 10-question US accounting quiz — within 3 days. Passing it earns the Verified badge, the thing US firms filter for first when hiring begins in late 2026.

To be straight with you: there's no job to apply for today. We're building the verified talent pool that US firms will hire from at launch, and verified profiles are shown first. If you're not shortlisted for the assessment right away, your application stays on file.

Nothing to do for now — just keep an eye on your inbox (and your spam folder, in case we land there). Questions? Reply to this email and a person will answer.

— AccountingTalent.in
Free for accounting professionals. Always.`,
  };
}

// ---- Employer lead: founding access reserved -----------------------------
// Sent best-effort the moment a firm submits the "Reserve founding access" form
// on the homepage (see app/actions.ts submitEmployerLead).
//
// This must say the same thing as the on-page confirmation state
// (firms.brief.success): place reserved, founding rate held, opens late 2026,
// nothing to pay, and a reply address that a person reads. The page tells them
// this email is coming and invites a reply to it, so the two cannot drift.
//
// It previously promised a shortlist of matched candidates within 72 hours and
// "you only pay when you hire", which was the concierge offer and survived the
// move to the database model. A firm reading the founding-access confirmation
// on the page and then this in their inbox was being told two different things.
//
// The $720 figure appears in four places: here, firms.pricing, the employerFaq
// "cost" answer, and the "A free, permanent profile" promise in content/home.ts
// (the accountant-facing page states the firm's fees too, on purpose). Move one,
// move all four.
export function emailEmployerLeadReceived(vars: { firm_name: string }): Composed {
  return {
    subject: "Your founding place is reserved, AccountingTalent",
    text: `Hi there,

Thanks for reserving founding access for ${vars.firm_name}. Your place is held, and so is your founding rate of $720 a year for as long as you stay subscribed.

What happens next: the database opens to US firms in late 2026 (October to December). You will hear from us then, and once a month until then with where the candidate pool stands, including the months when there is nothing new to report.

There is nothing to pay now and no obligation to subscribe when we open.

If you have questions, or anything about your firm's hiring plans changes, just reply to this email. It comes straight to a person.

Talk soon,
AccountingTalent`,
  };
}

// The reviewer's fail_reason maps to exactly one sentence from the spec.
export const FAIL_REASON_SENTENCE: Record<string, string> = {
  quiz_score:
    "your quiz score was {score}/10, and verification requires 7 or higher — the gap was on the US-specific questions",
  writing_generic:
    "your written answer didn't include the specific, first-hand detail we need to show US firms",
  writing_ai_or_copied:
    "your written answer appeared to be generated or copied rather than written from your own experience",
};

// ---- Email A: assessment delivery ----------------------------------------
export function emailInvite(vars: {
  first_name: string;
  assessment_link: string;
}): Composed {
  return {
    subject:
      "Your AccountingTalent.in skills assessment (this is the important one)",
    text: `Hi ${vars.first_name},

Good news — your application has been shortlisted. One step remains before your profile goes live in the verified pool: the skills assessment.

What it is: a short written question about a real accounting problem you've solved, plus 10 multiple-choice questions on US accounting and tax. Most people finish in 20–30 minutes.

Why it matters: passing earns the Verified badge — the thing US firms filter for first when hiring begins in late 2026. And your written answer appears on your profile, word for word, as "In their own words." Firms read it when deciding who to contact. Write it for them.

Two honest tips:
1. Be specific. Real numbers, real software, real steps. "I fixed a $18,400 bank-feed duplication in QuickBooks" beats a paragraph of adjectives.
2. Write it yourself. Generic or AI-written answers are rejected, and firms verify these stories in interviews.

Your assessment link: ${vars.assessment_link}
Please complete it within 7 days. There's no timer — take the time to do it properly.

Questions? Reply to this email and a person will answer.

— AccountingTalent.in
Free for accounting professionals. Always.`,
  };
}

// ---- Reminder: nudge a non-submitter whose link is still live ------------
// A short, low-pressure follow-up to Email A. Reuses the applicant's EXISTING
// assessment token (never mints a new invite), names their real expiry date,
// and gives an explicit easy out so it doesn't read as nagging.
export function emailReminder(vars: {
  first_name: string;
  assessment_link: string;
  expiry_date: string;
}): Composed {
  return {
    subject: "A quick nudge — your AccountingTalent.in assessment link is still open",
    text: `Hi ${vars.first_name},

Just a friendly reminder: your AccountingTalent.in skills assessment is still waiting, and your link closes on ${vars.expiry_date}. If you'd still like your profile in the verified pool that US firms will hire from, this is the one step that gets you there.

It's short — one written question about a real accounting problem you've solved, plus 10 multiple-choice questions on US accounting and tax. Most people finish in 20–30 minutes, and there's no timer.

Your assessment link: ${vars.assessment_link}

If the timing doesn't work or you've decided not to continue, no problem at all — you can ignore this. If you've hit a snag, just reply and a person will help.

— AccountingTalent.in
Free for accounting professionals. Always.`,
  };
}

// ---- Email B: pass / verified --------------------------------------------
export function emailPass(vars: {
  first_name: string;
  score: number;
  profile_number: number;
}): Composed {
  return {
    subject: `You're verified ✓ — founding member #${vars.profile_number}`,
    text: `Hi ${vars.first_name},

You passed. Your profile is now Verified — English writing assessment and US tax & accounting exam (${vars.score}/10) — and marked as a founding member, which means it's shown first when US firms begin searching the database in late 2026 (October–December).

What happens now: honestly, mostly waiting — and we'd rather say that than invent activity. We're recruiting more verified professionals and signing up founding US firms. You'll get an email from us at launch, and one before it. That's it — no spam in between.

Two things you can do meanwhile:
1. Keep your profile fresh. If your salary expectation, availability, or software skills change, reply to this email and we'll update it. Fresh profiles rank above stale ones.
2. Refer another accountant. Know a CA or accountant doing US work for agency pay? Send them accountingtalent.in/accountants — if they mention your name in the application, you'll both get featured placement at launch.

Your written answer now appears on your profile exactly as you wrote it. US firms will read it. We think they'll be impressed.

Welcome aboard,
AccountingTalent.in`,
  };
}

// ---- Email C: fail / not yet ---------------------------------------------
export function emailFail(vars: {
  first_name: string;
  fail_reason_sentence: string;
  retake_date: string;
}): Composed {
  return {
    subject: "Your assessment result — and the honest path forward",
    text: `Hi ${vars.first_name},

Thank you for completing the assessment. We're not able to verify your profile this time — and because we promise straight answers: ${vars.fail_reason_sentence}.

This is a not-yet, not a no. You can retake the assessment once, any time after ${vars.retake_date} (30 days from today). Between now and then, the highest-leverage preparation:

- If the quiz was the gap: the US-specific material — entity tax forms (1040, 1120-S, 1065, K-1), Form 941, and how US sales tax differs from GST — is very learnable. Intuit's QuickBooks Online ProAdvisor certification is free and covers the bookkeeping side; IRS form instructions (also free) cover the rest.
- If the writing sample was the gap: pick one real problem you personally solved, and write it as problem → steps → outcome with the actual numbers and software. Specific and imperfect beats polished and generic, every time.

Your application stays on file — you don't need to reapply, just reply to this email after ${vars.retake_date} and we'll send a fresh assessment link.

We built the bar high because that's what makes the Verified badge worth something to the firms who'll hire from this pool — including, we hope, to you on the second attempt.

— AccountingTalent.in`,
  };
}
