// Bulk-send Stage 2 assessment invites to eligible applicants who don't yet
// have an assessment row.
//
//   node --env-file=.env.local scripts/send-stage2-invites.mjs           # dry run
//   node --env-file=.env.local scripts/send-stage2-invites.mjs --live    # actually send
//
// Why a standalone script and not lib/supabase.ts: that module is `server-only`
// and can't be imported here, so we build our own service-role client from the
// same env vars.
//
// The two constraints this script exists to respect:
//   - The admin route is throttled to 10 req/min per IP, checked BEFORE auth, and
//     a throttled call returns 404 (not 429). So we pace ~7s/send and treat a 404
//     as "throttled, back off and retry", not "not found".
//   - The apex domain 308-redirects to www and can silently drop a POST, so the
//     base URL is pinned to https://www.accountingtalent.in.

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

// Everyone not filtered out. Higher rank = higher priority, used to pick the
// winner among duplicate-email applicants.
const ELIGIBLE_TIERS = ["waitlist", "standard", "fast_track"];
const TIER_RANK = { fast_track: 3, standard: 2, waitlist: 1 };

const SEND_INTERVAL_MS = 7000; // ~8.5/min, under the 10/min limit
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

async function main() {
  // 1. Eligible applicants.
  const { data: apps, error: appErr } = await db
    .from("applications")
    .select("id, full_name, email, tier, created_at")
    .in("tier", ELIGIBLE_TIERS);
  if (appErr) throw new Error(`applications query failed: ${appErr.message}`);

  // 2. Everyone who already has any assessment row => already invited.
  const { data: rows, error: aErr } = await db
    .from("assessments")
    .select("application_id");
  if (aErr) throw new Error(`assessments query failed: ${aErr.message}`);
  const invited = new Set(rows.map((r) => r.application_id));

  const uninvited = apps.filter((a) => !invited.has(a.id));

  // Emails that already have an invite (via some other application row). A person
  // who applied twice and was already invited on one row must NOT be re-invited on
  // the other — the in-batch dedup below can't see this because the winning row
  // isn't in `uninvited`. (Harish precedent.)
  const invitedEmails = new Set(
    apps.filter((a) => invited.has(a.id)).map((a) => (a.email ?? "").trim().toLowerCase()),
  );

  // 3. Dedup by email: drop anyone already invited under another row, then among
  //    the rest keep highest tier, then earliest created_at.
  const byEmail = new Map();
  const skippedAlreadyInvited = [];
  for (const a of uninvited) {
    const key = (a.email ?? "").trim().toLowerCase();
    if (invitedEmails.has(key)) {
      skippedAlreadyInvited.push(a);
      continue;
    }
    const cur = byEmail.get(key);
    if (!cur) {
      byEmail.set(key, a);
      continue;
    }
    const better =
      (TIER_RANK[a.tier] ?? 0) > (TIER_RANK[cur.tier] ?? 0) ||
      ((TIER_RANK[a.tier] ?? 0) === (TIER_RANK[cur.tier] ?? 0) &&
        new Date(a.created_at) < new Date(cur.created_at));
    if (better) byEmail.set(key, a);
  }
  const deduped = [...byEmail.values()].sort(
    (x, y) => new Date(x.created_at) - new Date(y.created_at),
  );
  const skippedExcluded = deduped.filter((a) => EXCLUDE.has(a.id));
  const recipients = deduped.filter((a) => !EXCLUDE.has(a.id));
  const skippedDups = uninvited.filter(
    (a) => !deduped.includes(a) && !skippedAlreadyInvited.includes(a),
  );

  // 4. Report.
  console.log(
    `\nEligible (${ELIGIBLE_TIERS.join(", ")}): ${apps.length}  |  ` +
      `already have an assessment row: ${apps.length - uninvited.length}  |  ` +
      `uninvited: ${uninvited.length}`,
  );
  if (skippedAlreadyInvited.length) {
    console.log(`\nEmail already invited under another application row — skipping:`);
    for (const a of skippedAlreadyInvited) {
      console.log(`  SKIP  ${a.email}  ${a.tier}  ${a.full_name}  (${a.id})`);
    }
  }
  if (skippedDups.length) {
    console.log(`\nDuplicate emails within the batch — skipping the lower/later row:`);
    for (const a of skippedDups) {
      console.log(`  SKIP  ${a.email}  ${a.tier}  ${a.full_name}  (${a.id})`);
    }
  }
  if (skippedExcluded.length) {
    console.log(`\nExcluded via --exclude:`);
    for (const a of skippedExcluded) {
      console.log(`  SKIP  ${a.email}  ${a.tier}  ${a.full_name}  (${a.id})`);
    }
  }
  console.log(`\n${LIVE ? "SENDING" : "Would send"} to ${recipients.length}:`);
  for (const a of recipients) {
    console.log(`  ${a.email.padEnd(34)} ${a.tier.padEnd(11)} ${a.full_name}  (${a.id})`);
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
    const a = recipients[i];
    const res = await sendOne(a.id);
    if (res.ok) {
      sent++;
      console.log(`  [${i + 1}/${recipients.length}] OK   ${a.email}  ${res.detail ?? ""}`);
    } else {
      errors.push({ a, res });
      console.log(`  [${i + 1}/${recipients.length}] FAIL ${a.email}  ${res.status} ${res.detail ?? ""}`);
    }
    if (i < recipients.length - 1) await sleep(SEND_INTERVAL_MS);
  }

  console.log(`\nDone. sent=${sent}  failed=${errors.length}  skipped-dup=${skippedDups.length}`);
  if (errors.length) {
    console.log("Failures:");
    for (const { a, res } of errors) {
      console.log(`  ${a.email}  ${res.status}  ${res.detail ?? ""}  (${a.id})`);
    }
    process.exitCode = 1;
  }
}

// POST one invite, backing off on a 404 (which for this route means "throttled").
async function sendOne(applicationId) {
  for (let attempt = 0; attempt <= MAX_THROTTLE_RETRIES; attempt++) {
    let resp;
    try {
      resp = await fetch(INVITE_URL, {
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
      // Throttled (or, far less likely, a genuinely missing application).
      if (attempt < MAX_THROTTLE_RETRIES) {
        console.log(`      throttled (404), waiting ${THROTTLE_BACKOFF_MS / 1000}s...`);
        await sleep(THROTTLE_BACKOFF_MS);
        continue;
      }
      return { ok: false, status: 404, detail: "still 404 after retries (throttled or missing)" };
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
