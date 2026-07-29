// Read-only Stage 2 assessment status report, classified by PERSON (deduped by
// email) rather than by row — so a person with a superseded expired attempt but a
// live attempt-2 link is NOT counted alongside people who genuinely have no live
// link. The raw "expired-without-submission" row count double-counts the former;
// this separates them.
//
//   node --env-file=.env.local scripts/assessment-status-report.mjs
//   node --env-file=.env.local scripts/assessment-status-report.mjs --list=needs_reactivation
//
// Per-person buckets (first match wins, most-progressed state):
//   verified            application is verified / has a passed assessment
//   submitted_pending   an assessment was submitted, awaiting a reviewer decision
//   live                has an active invite/started link (expires in the future)
//     live_fresh          ...and NO expired attempt behind it
//     live_after_expiry   ...WITH a prior expired-unsubmitted attempt (the "12" case)
//   needs_reactivation  every attempt expired unsubmitted, and NO live link  ← true targets
//   failed_or_other     failed, or an edge state with no live/expired-unsub row

import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const LIST = process.argv.find((a) => a.startsWith("--list="))?.slice("--list=".length);
const now = new Date();

const { data: assess, error } = await db
  .from("assessments")
  .select("id, application_id, status, expires_at, submitted_at, applications(email, full_name, verified_at)");
if (error) { console.error(error); process.exit(1); }

const emailOf = (r) => (r.applications?.email ?? "").toLowerCase().trim();
const isTest = (e) => /\.test$/.test(e) || e.endsWith("@example.com") || !e.includes("@");

// Group rows by person.
const people = new Map();
for (const r of assess) {
  const e = emailOf(r);
  if (isTest(e)) continue;
  if (!people.has(e)) people.set(e, { email: e, name: r.applications?.full_name ?? "", verified: !!r.applications?.verified_at, rows: [] });
  const p = people.get(e);
  if (r.applications?.verified_at) p.verified = true;
  p.rows.push(r);
}

function classify(p) {
  const rows = p.rows;
  const has = (pred) => rows.some(pred);
  const active = (r) => ["invited", "started"].includes(r.status) && new Date(r.expires_at) >= now;
  const expiredUnsub = (r) => !r.submitted_at && new Date(r.expires_at) < now;

  if (p.verified || has((r) => r.status === "passed")) return "verified";
  if (has((r) => r.status === "submitted")) return "submitted_pending";
  if (has(active)) return has(expiredUnsub) ? "live_after_expiry" : "live_fresh";
  if (has(expiredUnsub)) return "needs_reactivation";
  return "failed_or_other";
}

const buckets = {};
const lists = {};
for (const p of people.values()) {
  const b = classify(p);
  buckets[b] = (buckets[b] ?? 0) + 1;
  (lists[b] ??= []).push(p);
  // "live" umbrella count for convenience
  if (b === "live_fresh" || b === "live_after_expiry") buckets.live = (buckets.live ?? 0) + 1;
}

// Row-level contrast: raw expired-unsubmitted ROW count (what a naive metric shows).
const rawExpiredRows = assess.filter((r) => !isTest(emailOf(r)) && !r.submitted_at && new Date(r.expires_at) < now).length;

const order = ["verified","submitted_pending","live_fresh","live_after_expiry","needs_reactivation","failed_or_other"];
console.log(`People (deduped by email): ${people.size}\n`);
for (const k of order) console.log(`  ${k.padEnd(20)} ${buckets[k] ?? 0}`);
console.log(`  ${"live (subtotal)".padEnd(20)} ${buckets.live ?? 0}`);
console.log(`\nContrast:`);
console.log(`  Raw expired-unsubmitted ROWS:            ${rawExpiredRows}`);
console.log(`  People who ACTUALLY have no live link:   ${buckets.needs_reactivation ?? 0}   ← real reactivation targets`);
console.log(`  (difference = superseded attempts behind a live link: ${(buckets.live_after_expiry ?? 0)})`);

if (LIST && lists[LIST]) {
  console.log(`\n--- ${LIST} (${lists[LIST].length}) ---`);
  for (const p of lists[LIST].sort((a, b) => a.email.localeCompare(b.email))) {
    console.log(`  ${p.email.padEnd(38)} "${p.name}"`);
  }
} else if (LIST) {
  console.log(`\n(no people in bucket '${LIST}'; valid buckets: ${order.join(", ")})`);
}
