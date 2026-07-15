import "server-only";
import { Resend } from "resend";

/*
  The three Stage 2 emails, verbatim from spec Part 4. Plain text on purpose: the
  spec is explicit that "trust reads better than HTML gloss for this audience."

  Sending is environment-keyed, per the agreed behaviour:
  - Development (VERCEL_ENV !== "production"): if RESEND_API_KEY is missing, log
    the fully composed email prefixed [EMAIL-MOCK] and report success, so the
    whole invite/result flow is testable without Resend or DNS.
  - Production: a missing key or any Resend error reports FAILURE. Callers must
    not complete their state transition unless send() returned ok — no "verified
    but never told them" rows.
*/

const FROM = "AccountingTalent.in <hello@mail.accountingtalent.in>";
const REPLY_TO = "contact@accountingtalent.in";

const apiKey = process.env.RESEND_API_KEY;
export const resendConfigured = Boolean(apiKey);
const isProd = process.env.VERCEL_ENV === "production";

const resend = apiKey ? new Resend(apiKey) : null;

export type Composed = { subject: string; text: string };
export type SendResult = { ok: boolean; error?: string; mocked?: boolean };

export async function sendEmail(to: string, email: Composed): Promise<SendResult> {
  if (!resend) {
    if (isProd) {
      return { ok: false, error: "RESEND_API_KEY is not set in production" };
    }
    // Dev mock: prove exactly what would have gone out.
    console.info(
      `[EMAIL-MOCK] to=${to} from=${FROM}\n[EMAIL-MOCK] subject: ${email.subject}\n[EMAIL-MOCK] body:\n${email.text}`,
    );
    return { ok: true, mocked: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: email.subject,
      text: email.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
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
2. Refer another accountant. Know a CA or accountant doing US work for agency pay? Send them accountingtalent.in — if they mention your name in the application, you'll both get featured placement at launch.

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
