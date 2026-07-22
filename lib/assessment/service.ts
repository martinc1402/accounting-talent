import "server-only";
import { randomUUID } from "node:crypto";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  emailFail,
  emailInvite,
  emailPass,
  emailReminder,
  FAIL_REASON_SENTENCE,
  firstNameOf,
  sendEmail,
} from "@/lib/assessment/emails";

/*
  The two admin operations, with the send-before-stamp ordering agreed for this
  feature: in production nothing is written to a durable "verified" or "invited"
  state until Resend has accepted the email, so there is never a passed applicant
  who was never told, nor an invite row whose email never went out.

  In development the email is a logged [EMAIL-MOCK] and always "succeeds", so the
  whole flow (rows, status, founding numbers) is exercisable without Resend.
*/

export type AdminResult =
  | { ok: true; detail: string }
  | { ok: false; status: number; error: string };

function requireDb() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

// ---- Invite (Email A) -----------------------------------------------------
export async function sendAssessmentInvite(
  applicationId: string,
  baseUrl: string,
): Promise<AdminResult> {
  const db = requireDb();

  const { data: app, error: appErr } = await db
    .from("applications")
    .select("id, full_name, email")
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) return { ok: false, status: 500, error: appErr.message };
  if (!app) return { ok: false, status: 404, error: "No such application" };

  // Refuse a second live invite. A retake (after fail/expiry) is allowed because
  // those rows are not active.
  const nowIso = new Date().toISOString();
  const { data: active, error: activeErr } = await db
    .from("assessments")
    .select("id")
    .eq("application_id", applicationId)
    .in("status", ["invited", "started"])
    .gt("expires_at", nowIso)
    .limit(1);

  if (activeErr) return { ok: false, status: 500, error: activeErr.message };
  if (active && active.length > 0) {
    return {
      ok: false,
      status: 409,
      error: "An active assessment invite already exists for this application",
    };
  }

  // attempt_number = prior assessments + 1.
  const { count: priorCount } = await db
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .eq("application_id", applicationId);
  const attemptNumber = (priorCount ?? 0) + 1;

  // Token generated app-side so the link exists before the row does: we send
  // first, insert second.
  const token = randomUUID();
  const link = `${baseUrl.replace(/\/$/, "")}/assessment/${token}`;

  const sent = await sendEmail(
    app.email,
    emailInvite({ first_name: firstNameOf(app.full_name), assessment_link: link }),
  );
  if (!sent.ok) {
    return { ok: false, status: 502, error: `Email not sent: ${sent.error}` };
  }

  const invitedAt = new Date();
  const expiresAt = new Date(invitedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { error: insErr } = await db.from("assessments").insert({
    application_id: applicationId,
    token,
    status: "invited",
    invited_at: invitedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    attempt_number: attemptNumber,
    invite_email_sent_at: invitedAt.toISOString(),
  });
  if (insErr) {
    // Email went out but the row failed — surface loudly; the applicant has a
    // link with no backing row and re-invite will refuse nothing.
    return {
      ok: false,
      status: 500,
      error: `Email sent but row insert failed: ${insErr.message}`,
    };
  }

  return {
    ok: true,
    detail: `invited attempt ${attemptNumber}${sent.mocked ? " (email mocked)" : ""}`,
  };
}

// ---- Reminder -------------------------------------------------------------
// Nudge an applicant who was invited but hasn't submitted. Reuses the EXISTING
// live assessment token (never creates a new attempt) and refuses when there's
// nothing live to remind about (already submitted, expired, or never invited).
export async function sendAssessmentReminder(
  applicationId: string,
  baseUrl: string,
): Promise<AdminResult> {
  const db = requireDb();

  const { data: app, error: appErr } = await db
    .from("applications")
    .select("id, full_name, email")
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) return { ok: false, status: 500, error: appErr.message };
  if (!app) return { ok: false, status: 404, error: "No such application" };

  // The one live, unsubmitted invite for this application. A reminder only makes
  // sense while a link still works, so we require status invited/started and a
  // future expiry — the newest such row if there's more than one.
  const nowIso = new Date().toISOString();
  const { data: active, error: activeErr } = await db
    .from("assessments")
    .select("id, token, expires_at")
    .eq("application_id", applicationId)
    .in("status", ["invited", "started"])
    .gt("expires_at", nowIso)
    .order("invited_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeErr) return { ok: false, status: 500, error: activeErr.message };
  if (!active) {
    return {
      ok: false,
      status: 409,
      error: "No live, unsubmitted assessment to remind about",
    };
  }

  const link = `${baseUrl.replace(/\/$/, "")}/assessment/${active.token}`;
  const expiryDate = new Date(active.expires_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sent = await sendEmail(
    app.email,
    emailReminder({
      first_name: firstNameOf(app.full_name),
      assessment_link: link,
      expiry_date: expiryDate,
    }),
  );
  if (!sent.ok) {
    return { ok: false, status: 502, error: `Email not sent: ${sent.error}` };
  }

  // No status change and no new column: a reminder reuses the live invite as-is.
  // The durable "already reminded" signal is the admin_actions log the route
  // writes (action: "remind"), which a future pass can read to exclude repeats.
  return {
    ok: true,
    detail: `reminded (expires ${expiryDate})${sent.mocked ? " (email mocked)" : ""}`,
  };
}

// ---- Result (Email B or C) ------------------------------------------------
export async function sendResult(
  assessmentId: string,
  outcome: "passed" | "failed",
  opts: { failReason?: string; override?: boolean; reviewedBy?: string } = {},
): Promise<AdminResult> {
  const db = requireDb();

  const { data: a, error: aErr } = await db
    .from("assessments")
    .select("id, application_id, status, quiz_score")
    .eq("id", assessmentId)
    .maybeSingle();

  if (aErr) return { ok: false, status: 500, error: aErr.message };
  if (!a) return { ok: false, status: 404, error: "No such assessment" };

  // Fat-finger guard: only a submitted assessment can be decided. Blocks
  // double-sends and result-before-submission.
  if (a.status !== "submitted") {
    return {
      ok: false,
      status: 409,
      error: `Assessment status is '${a.status}', not 'submitted'`,
    };
  }

  const { data: app, error: appErr } = await db
    .from("applications")
    .select("full_name, email")
    .eq("id", a.application_id)
    .maybeSingle();
  if (appErr) return { ok: false, status: 500, error: appErr.message };
  if (!app) return { ok: false, status: 404, error: "No such application" };

  const firstName = firstNameOf(app.full_name);
  const score = a.quiz_score ?? 0;
  const reviewedAt = new Date().toISOString();

  if (outcome === "passed") {
    // Never pass under 7 without an explicit, logged override.
    if (score < 7 && !opts.override) {
      return {
        ok: false,
        status: 409,
        error: `Quiz score ${score} is below 7; pass 'override: true' to force`,
      };
    }

    // Reserve the founding number so it can go in the email; commit it only
    // after the send succeeds (a failed send leaves a harmless sequence gap).
    const { data: reserved, error: seqErr } = await db.rpc(
      "reserve_founding_member_number",
    );
    if (seqErr) return { ok: false, status: 500, error: seqErr.message };
    const foundingNumber = Number(reserved);

    const sent = await sendEmail(
      app.email,
      emailPass({ first_name: firstName, score, profile_number: foundingNumber }),
    );
    if (!sent.ok) {
      return { ok: false, status: 502, error: `Email not sent: ${sent.error}` };
    }

    const { error: upAppErr } = await db
      .from("applications")
      .update({
        verified_at: reviewedAt,
        assessment_score: score,
        founding_member_number: foundingNumber,
      })
      .eq("id", a.application_id);
    if (upAppErr) return { ok: false, status: 500, error: upAppErr.message };

    const { error: upAErr } = await db
      .from("assessments")
      .update({
        status: "passed",
        writing_pass: true,
        reviewed_at: reviewedAt,
        reviewed_by: opts.reviewedBy ?? "admin",
        result_email_sent_at: reviewedAt,
      })
      .eq("id", assessmentId);
    if (upAErr) return { ok: false, status: 500, error: upAErr.message };

    return {
      ok: true,
      detail: `passed, founding member #${foundingNumber}${
        opts.override ? " (override)" : ""
      }${sent.mocked ? " (email mocked)" : ""}`,
    };
  }

  // outcome === "failed"
  const reason = opts.failReason ?? "";
  const template = FAIL_REASON_SENTENCE[reason];
  if (!template) {
    return {
      ok: false,
      status: 400,
      error:
        "failReason must be one of: quiz_score, writing_generic, writing_ai_or_copied",
    };
  }
  const sentence = template.replace("{score}", String(score));
  const retake = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const retakeDate = retake.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sent = await sendEmail(
    app.email,
    emailFail({
      first_name: firstName,
      fail_reason_sentence: sentence,
      retake_date: retakeDate,
    }),
  );
  if (!sent.ok) {
    return { ok: false, status: 502, error: `Email not sent: ${sent.error}` };
  }

  const { error: upErr } = await db
    .from("assessments")
    .update({
      status: "failed",
      fail_reason: reason,
      writing_pass: reason.startsWith("writing_") ? false : null,
      reviewed_at: reviewedAt,
      reviewed_by: opts.reviewedBy ?? "admin",
      result_email_sent_at: reviewedAt,
    })
    .eq("id", assessmentId);
  if (upErr) return { ok: false, status: 500, error: upErr.message };

  return {
    ok: true,
    detail: `failed (${reason})${sent.mocked ? " (email mocked)" : ""}`,
  };
}
