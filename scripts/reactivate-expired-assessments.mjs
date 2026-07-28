// Reactivate Stage 2 assessments that EXPIRED without a submission, reusing the
// SAME link (token) the applicant already has, and email them to say the link is
// live again for a fresh 7 days.
//
//   node --env-file=.env.local scripts/reactivate-expired-assessments.mjs           # dry run
//   node --env-file=.env.local scripts/reactivate-expired-assessments.mjs --live    # actually bump + send
//   ... --exclude=<appId,appId>                                                     # hold specific rows
//
// This does NOT go through the admin invite route (that mints a fresh token); it
// bumps expires_at on the existing row and sends via Resend directly, so the
// original /assessment/<token> URL keeps working and 'started' rows resume their
// saved answers. Status is left as-is.
//
// Target set (matches the resend-script safety net):
//   - assessment has no submitted_at and expires_at < now  (expired, unsubmitted)
//   - EXCLUDE if the same email has a terminal row (submitted/passed/failed) anywhere
//   - EXCLUDE if the same email has an ACTIVE invite (invited|started, not expired) anywhere
//   - EXCLUDE test/invalid emails
//   - dedup by email, keeping the most-recently-invited expired row
//
// Pacing: ~700ms between live sends (Resend default ~2 req/s). The admin-route
// 10/min-per-IP limit does not apply here — we call Resend directly.

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const LIVE = process.argv.includes("--live");
const EXCLUDE = new Set(
  (process.argv.find((a) => a.startsWith("--exclude="))?.slice("--exclude=".length) ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean),
);

const BASE_URL = "https://www.accountingtalent.in";
const FROM = "AccountingTalent.in <hello@mail.accountingtalent.in>";
const REPLY_TO = "contact@accountingtalent.in";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (LIVE && !RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY (required for --live)");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const firstNameOf = (n) => ((n ?? "").trim().split(/\s+/)[0] || "there");
const emailOf = (r) => (r.applications?.email ?? "").toLowerCase().trim();
const isTest = (e) => /\.test$/.test(e) || e.endsWith("@example.com") || !e.includes("@");

function composeEmail(firstName, link) {
  return {
    subject: "Your AccountingTalent.in assessment link is live again",
    text: `Hi ${firstName},

A while back we sent you the AccountingTalent.in skills assessment, and the link quietly expired before you finished it. That happens — life gets busy.

Good news: we've reactivated it. The same link works again, and you've got a fresh 7 days:

${link}

Nothing has changed — a short written question about a real accounting problem you've solved, plus 10 multiple-choice questions on US accounting and tax. Most people finish in 20–30 minutes. Passing earns the Verified badge — the thing US firms filter for first when hiring begins in late 2026 — and your written answer appears on your profile, word for word.

If the timing just wasn't right before, we'd genuinely like you to have another go. If you'd rather not continue, no action needed.

Questions? Reply to this email and a person will answer.

— AccountingTalent.in
Free for accounting professionals. Always.`,
  };
}

// ---- Build the target set --------------------------------------------------
const { data: all, error } = await db
  .from("assessments")
  .select("id, application_id, token, status, expires_at, submitted_at, invited_at, applications(email, full_name)");
if (error) { console.error(error); process.exit(1); }

const expired = all.filter((r) => !r.submitted_at && new Date(r.expires_at) < new Date());
const terminalEmails = new Set(
  all.filter((r) => ["submitted", "passed", "failed"].includes(r.status)).map(emailOf));
const activeEmails = new Set(
  all.filter((r) => ["invited", "started"].includes(r.status) && new Date(r.expires_at) >= new Date()).map(emailOf));

const eligible = [];
for (const r of expired) {
  const e = emailOf(r);
  if (isTest(e)) continue;
  if (terminalEmails.has(e)) continue;
  if (activeEmails.has(e)) continue;
  if (EXCLUDE.has(r.application_id)) continue;
  eligible.push(r);
}
const byEmail = new Map();
for (const r of eligible) {
  const e = emailOf(r);
  const cur = byEmail.get(e);
  if (!cur || new Date(r.invited_at) > new Date(cur.invited_at)) byEmail.set(e, r);
}
const targets = [...byEmail.values()].sort((a, b) => emailOf(a).localeCompare(emailOf(b)));

console.log(`Mode: ${LIVE ? "LIVE" : "DRY RUN"}   Targets: ${targets.length}\n`);

let ok = 0, failed = 0;
for (const r of targets) {
  const email = emailOf(r);
  const link = `${BASE_URL}/assessment/${r.token}`;
  const msg = composeEmail(firstNameOf(r.applications?.full_name), link);
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  if (!LIVE) {
    console.log(`── ${email}  (status=${r.status}, appId=${r.application_id})`);
    console.log(`   link: ${link}`);
    console.log(`   new expires_at: ${newExpiry}`);
    console.log(`   subject: ${msg.subject}`);
    console.log("");
    continue;
  }

  try {
    const { error: sendErr } = await resend.emails.send({
      from: FROM, to: email, replyTo: REPLY_TO, subject: msg.subject, text: msg.text,
    });
    if (sendErr) throw new Error(sendErr.message);

    const nowIso = new Date().toISOString();
    // Send-before-stamp: only extend the window after the email is accepted.
    const { error: upErr } = await db
      .from("assessments")
      .update({ expires_at: newExpiry, invite_email_sent_at: nowIso })
      .eq("id", r.id);
    if (upErr) throw new Error(`sent but expires_at update failed: ${upErr.message}`);

    await db.from("admin_actions").insert({
      action: "reactivate_expired_assessment",
      application_id: r.application_id,
      assessment_id: r.id,
      outcome: "ok",
      detail: `reused token, new expires_at ${newExpiry}`,
      actor: "reactivate-script",
    });

    ok++;
    console.log(`✓ ${email}  (reactivated, emailed)`);
  } catch (e) {
    failed++;
    console.error(`✗ ${email}  ${e.message}`);
    await db.from("admin_actions").insert({
      action: "reactivate_expired_assessment",
      application_id: r.application_id,
      assessment_id: r.id,
      outcome: "error",
      detail: String(e.message),
      actor: "reactivate-script",
    });
  }
  await sleep(700);
}

if (LIVE) console.log(`\nDone. reactivated=${ok} failed=${failed}`);
else console.log(`Dry run complete. ${targets.length} would be reactivated + emailed. Re-run with --live to send.`);
