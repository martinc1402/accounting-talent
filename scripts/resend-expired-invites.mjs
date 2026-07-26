// Re-send Stage 2 assessment invites to applicants whose invite EXPIRED without a
// submission. The invite endpoint creates a fresh attempt (new email, new 7-day
// window) for any application with no *active* invite — so this just targets the
// right set and posts to the same endpoint.
//
//   node --env-file=.env.local scripts/resend-expired-invites.mjs           # dry run
//   node --env-file=.env.local scripts/resend-expired-invites.mjs --live    # actually send
//   ... --exclude=<id,id>                                                   # hold specific rows
//
// Selection: an application is a target when
//   - it has >=1 assessment row, and
//   - it has NO terminal row (submitted / passed / failed), and
//   - it has NO active invite (invited|started with expires_at > now).
// Email-level guard: an application is dropped if the SAME email has a terminal or
// active assessment under ANY other application row (duplicate-applicant safety —
// the Harish/Gururaj trap). Also drops @*.test harness accounts.
//
// Same infra constraints as send-stage2-invites.mjs: pace ~7s/send (admin route is
// 10/min per IP, checked before auth, and a throttled call returns 404 not 429),
// and pin the www host (apex 308-redirects and can drop a POST).

import { createClient } from "@supabase/supabase-js";

const LIVE = process.argv.includes("--live");
const EXCLUDE = new Set(
  (process.argv.find((a) => a.startsWith("--exclude="))?.slice("--exclude=".length) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
const BASE_URL = "https://www.accountingtalent.in";
const INVITE_URL = `${BASE_URL}/api/admin/assessment/invite`;

const ELIGIBLE_TIERS = ["waitlist", "standard", "fast_track"];
const TERMINAL = new Set(["submitted", "passed", "failed"]);
const isTestEmail = (email) => /\.test$/i.test((email ?? "").trim());
const norm = (e) => (e ?? "").trim().toLowerCase();

const SEND_INTERVAL_MS = 7000;
const THROTTLE_BACKOFF_MS = 65000;
const MAX_THROTTLE_RETRIES = 5;

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_TASK_SECRET } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local)");
  process.exit(1);
}
if (LIVE && !ADMIN_TASK_SECRET) {
  console.error("Missing ADMIN_TASK_SECRET (required for --live)");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const now = new Date();

  const { data: apps, error: appErr } = await db
    .from("applications")
    .select("id, full_name, email, tier, created_at")
    .in("tier", ELIGIBLE_TIERS);
  if (appErr) throw new Error(`applications query failed: ${appErr.message}`);
  const appById = new Map(apps.map((a) => [a.id, a]));

  const { data: asmts, error: aErr } = await db
    .from("assessments")
    .select("application_id, status, expires_at, attempt_number");
  if (aErr) throw new Error(`assessments query failed: ${aErr.message}`);

  const isActive = (a) =>
    (a.status === "invited" || a.status === "started") && new Date(a.expires_at) > now;

  // Email-level state across ALL application rows (duplicate-applicant safety).
  const emailTerminal = new Set();
  const emailActive = new Set();
  for (const a of asmts) {
    const app = appById.get(a.application_id);
    if (!app) continue;
    const key = norm(app.email);
    if (TERMINAL.has(a.status)) emailTerminal.add(key);
    if (isActive(a)) emailActive.add(key);
  }

  const byApp = new Map();
  for (const a of asmts) {
    const arr = byApp.get(a.application_id) ?? [];
    arr.push(a);
    byApp.set(a.application_id, arr);
  }

  const recipients = [];
  const skippedEmail = [];
  const skippedTest = [];
  const skippedExcluded = [];
  for (const [appId, arr] of byApp) {
    const app = appById.get(appId);
    if (!app) continue; // not an eligible-tier application
    if (arr.some((a) => TERMINAL.has(a.status))) continue; // submitted somewhere
    if (arr.some(isActive)) continue; // still has a live invite
    const key = norm(app.email);
    const attempts = arr.length;
    const statuses = arr.map((a) => a.status).join("/");
    const expired = arr.map((a) => a.expires_at).sort().pop()?.slice(0, 10);
    const rec = { ...app, attempts, statuses, expired };
    if (isTestEmail(app.email)) { skippedTest.push(rec); continue; }
    if (emailTerminal.has(key) || emailActive.has(key)) { skippedEmail.push(rec); continue; }
    if (EXCLUDE.has(appId)) { skippedExcluded.push(rec); continue; }
    recipients.push(rec);
  }
  recipients.sort((a, b) => (a.expired < b.expired ? -1 : 1));

  console.log(`\nExpired & never submitted (re-invite candidates): ${recipients.length}`);
  const report = (label, list) => {
    if (!list.length) return;
    console.log(`\n${label}:`);
    for (const r of list) {
      console.log(`  SKIP  ${r.email.padEnd(34)} ${r.tier.padEnd(11)} [${r.statuses}] exp=${r.expired}  ${r.full_name}  (${r.id})`);
    }
  };
  report("Same email has a terminal/active assessment elsewhere — skipping", skippedEmail);
  report("Test-harness account (@*.test) — never invited", skippedTest);
  report("Excluded via --exclude", skippedExcluded);

  console.log(`\n${LIVE ? "SENDING" : "Would send"} to ${recipients.length}:`);
  for (const r of recipients) {
    console.log(`  ${r.email.padEnd(34)} ${r.tier.padEnd(11)} [${r.statuses}] exp=${r.expired}  ${r.full_name}  (${r.id})`);
  }

  if (!LIVE) {
    console.log(`\nDry run. Re-run with --live to send.\n`);
    return;
  }

  console.log("");
  let sent = 0;
  const errors = [];
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const res = await sendOne(r.id);
    if (res.ok) {
      sent++;
      console.log(`  [${i + 1}/${recipients.length}] OK   ${r.email}  ${res.detail ?? ""}`);
    } else {
      errors.push({ r, res });
      console.log(`  [${i + 1}/${recipients.length}] FAIL ${r.email}  ${res.status} ${res.detail ?? ""}`);
    }
    if (i < recipients.length - 1) await sleep(SEND_INTERVAL_MS);
  }

  console.log(`\nDone. sent=${sent}  failed=${errors.length}`);
  if (errors.length) {
    console.log("Failures:");
    for (const { r, res } of errors) console.log(`  ${r.email}  ${res.status}  ${res.detail ?? ""}  (${r.id})`);
    process.exitCode = 1;
  }
}

async function sendOne(applicationId) {
  for (let attempt = 0; attempt <= MAX_THROTTLE_RETRIES; attempt++) {
    let resp;
    try {
      resp = await fetch(INVITE_URL, {
        method: "POST",
        redirect: "manual",
        headers: { "content-type": "application/json", authorization: `Bearer ${ADMIN_TASK_SECRET}` },
        body: JSON.stringify({ application_id: applicationId }),
      });
    } catch (e) {
      return { ok: false, status: "network", detail: String(e) };
    }
    if (resp.status === 404) {
      if (attempt < MAX_THROTTLE_RETRIES) {
        console.log(`      throttled (404), waiting ${THROTTLE_BACKOFF_MS / 1000}s...`);
        await sleep(THROTTLE_BACKOFF_MS);
        continue;
      }
      return { ok: false, status: 404, detail: "still 404 after retries (throttled or missing)" };
    }
    let body = null;
    try { body = await resp.json(); } catch { /* non-JSON */ }
    if (resp.ok && body?.ok) return { ok: true, detail: body.detail };
    return { ok: false, status: resp.status, detail: body?.error ?? resp.statusText };
  }
  return { ok: false, status: "exhausted", detail: "retry loop exhausted" };
}

main().catch((e) => { console.error(e); process.exit(1); });
