import "server-only";
import { Resend } from "resend";

/*
  The one outbound-email transport. Every email the product sends goes through
  here: the Stage 1/2 assessment emails (lib/assessment/emails.ts), the employer
  lead acknowledgement, and the sign-in emails (lib/auth/emails.ts).

  This used to live inside lib/assessment/emails.ts. It moved out when auth
  started sending its own mail, so that "how we send" is one decision and each
  feature only owns "what we say". lib/assessment/emails.ts re-exports it, so
  existing call sites are unchanged.

  Sending is environment-keyed, per the agreed behaviour:
  - Development (VERCEL_ENV !== "production"): if RESEND_API_KEY is missing, log
    the fully composed email prefixed [EMAIL-MOCK] and report success, so the
    whole flow is testable without Resend or DNS.
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
