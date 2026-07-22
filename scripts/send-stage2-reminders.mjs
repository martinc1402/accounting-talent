// Bulk-send Stage 2 assessment REMINDERS to applicants who were invited but
// haven't submitted, and whose link is about to expire.
//
//   node --env-file=.env.local scripts/send-stage2-reminders.mjs            # dry run
//   node --env-file=.env.local scripts/send-stage2-reminders.mjs --live     # actually send
//   ... --threshold=3.5     # days-to-expiry cutoff (default 3.5)
//   ... --base=http://localhost:3000   # endpoint host (default localhost:3000)
//   ... --exclude=<id,id>
//
// Unlike the invite sender, the /remind endpoint is NOT deployed to production,
// so this points at a LOCAL Next server. Start it with the prod site URL pinned
// so the assessment links resolve to www.accountingtalent.in, not localhost:
//
//   NEXT_PUBLIC_SITE_URL=https://www.accountingtalent.in npm run dev
//
// A reminder reuses the applicant's EXISTING live token (no new attempt). The
// endpoint refuses anything not live/unsubmitted, and logs action:"remind" to
// admin_actions — which this script reads to skip anyone already reminded, so a
// second pass is safe.

import { createClient } from "@supabase/supabase-js";

const LIVE = process.argv.includes("--live");
const arg = (name, def) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const THRESHOLD_DAYS = Number(arg("threshold", "3.5"));
const BASE_URL = arg("base", "http://localhost:3000").replace(/\/$/, "");
const REMIND_URL = `${BASE_URL}/api/admin/assessment/remind`;
const EXCLUDE = new Set(
  (arg("exclude", "") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
);

const SEND_INTERVAL_MS = 7000; // ~8.5/min, under the admin 10/min limit
const THROTTLE_BACKOFF_MS = 65000; // 404 => wait past the 60s sliding window
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

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

async function main() {
  const now = Date.now();
  const cutoff = new Date(now + THRESHOLD_DAYS * 86400000).toISOString();
  const nowIso = new Date(now).toISOString();

  // 1. Live, unsubmitted invites expiring within the threshold.
  const { data: rows, error: aErr } = await db
    .from("assessments")
    .select("id, application_id, status, invited_at, expires_at")
    .in("status", ["invited", "started"])
    .gt("expires_at", nowIso)
    .lte("expires_at", cutoff);
  if (aErr) throw new Error(`assessments query failed: ${aErr.message}`);

  // 2. Anyone already reminded (durable, via the admin_actions log).
  const { data: acts, error: actErr } = await db
    .from("admin_actions")
    .select("application_id, outcome")
    .eq("action", "remind")
    .eq("outcome", "sent");
  if (actErr) throw new Error(`admin_actions query failed: ${actErr.message}`);
  const alreadyReminded = new Set(acts.map((r) => r.application_id));

  // 3. Applicant details.
  const ids = [...new Set(rows.map((r) => r.application_id))];
  const { data: apps, error: appErr } = ids.length
    ? await db.from("applications").select("id, full_name, email").in("id", ids)
    : { data: [], error: null };
  if (appErr) throw new Error(`applications query failed: ${appErr.message}`);
  const appById = new Map(apps.map((a) => [a.id, a]));

  const all = rows
    .map((r) => ({ ...r, app: appById.get(r.application_id) ?? {} }))
    .sort((x, y) => new Date(x.expires_at) - new Date(y.expires_at));

  const skippedReminded = all.filter((r) => alreadyReminded.has(r.application_id));
  const skippedExcluded = all.filter(
    (r) => !alreadyReminded.has(r.application_id) && EXCLUDE.has(r.application_id),
  );
  const recipients = all.filter(
    (r) => !alreadyReminded.has(r.application_id) && !EXCLUDE.has(r.application_id),
  );

  // 4. Report.
  console.log(
    `\nLive, unsubmitted, expiring within ${THRESHOLD_DAYS}d: ${all.length}  |  ` +
      `already reminded: ${skippedReminded.length}  |  excluded: ${skippedExcluded.length}  |  ` +
      `to remind: ${recipients.length}`,
  );
  console.log(`Endpoint: ${REMIND_URL}`);
  for (const r of skippedReminded) {
    console.log(`  SKIP (reminded)  ${r.app.email}  ${r.app.full_name}  (${r.application_id})`);
  }
  for (const r of skippedExcluded) {
    console.log(`  SKIP (excluded)  ${r.app.email}  ${r.app.full_name}  (${r.application_id})`);
  }
  console.log(`\n${LIVE ? "SENDING" : "Would send"} to ${recipients.length}:`);
  for (const r of recipients) {
    const days = ((new Date(r.expires_at) - now) / 86400000).toFixed(1);
    console.log(
      `  ${(r.app.email ?? "?").padEnd(34)} ${r.status.padEnd(8)} expires ${fmtDate(
        r.expires_at,
      )} (${days}d)  ${r.app.full_name ?? ""}`,
    );
  }

  if (!LIVE) {
    console.log(`\nDry run. Re-run with --live to send.\n`);
    return;
  }

  // 5. Live send, paced.
  console.log("");
  let sent = 0;
  const errors = [];
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const res = await sendOne(r.application_id);
    if (res.ok) {
      sent++;
      console.log(`  [${i + 1}/${recipients.length}] OK   ${r.app.email}  ${res.detail ?? ""}`);
    } else {
      errors.push({ r, res });
      console.log(`  [${i + 1}/${recipients.length}] FAIL ${r.app.email}  ${res.status} ${res.detail ?? ""}`);
    }
    if (i < recipients.length - 1) await sleep(SEND_INTERVAL_MS);
  }

  console.log(`\nDone. sent=${sent}  failed=${errors.length}`);
  if (errors.length) {
    console.log("Failures:");
    for (const { r, res } of errors) {
      console.log(`  ${r.app.email}  ${res.status}  ${res.detail ?? ""}  (${r.application_id})`);
    }
    process.exitCode = 1;
  }
}

// POST one reminder, backing off on a 404 (which for this route means throttled).
async function sendOne(applicationId) {
  for (let attempt = 0; attempt <= MAX_THROTTLE_RETRIES; attempt++) {
    let resp;
    try {
      resp = await fetch(REMIND_URL, {
        method: "POST",
        redirect: "manual",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ADMIN_TASK_SECRET}`,
        },
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
      return { ok: false, status: 404, detail: "still 404 after retries (throttled or route missing)" };
    }

    let body = null;
    try {
      body = await resp.json();
    } catch {
      /* non-JSON body */
    }
    if (resp.ok && body?.ok) return { ok: true, detail: body.detail };
    return { ok: false, status: resp.status, detail: body?.error ?? resp.statusText };
  }
  return { ok: false, status: "exhausted", detail: "retry loop exhausted" };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
