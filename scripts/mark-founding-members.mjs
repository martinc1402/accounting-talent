// Mark founding members: every application created before the 2026-10 pivot
// (when "/" became a paid job-search membership) gets founding_member = true, so
// the people who signed up under the old "always free" promise keep free access.
//
//   node --env-file=.env.local scripts/mark-founding-members.mjs              # dry run (default)
//   node --env-file=.env.local scripts/mark-founding-members.mjs --live       # actually update
//   ... --before=2026-10-03T00:00:00+05:30                                    # override the cutoff
//
// Requires migration 0023_applications_founding_member.sql to be applied first.
//
// Cutoff defaults to midnight IST on 2026-10-03, the day of the pivot: anything
// created strictly before that instant is a founding member. IST because the
// applicants are in India and "applied before today" means their today.
//
// Safe to re-run. It only touches rows where founding_member is still false, and
// it never sets anything back to false.

import { createClient } from "@supabase/supabase-js";

const LIVE = process.argv.includes("--live");
const BEFORE =
  process.argv.find((a) => a.startsWith("--before="))?.slice("--before=".length) ??
  "2026-10-03T00:00:00+05:30";

const cutoff = new Date(BEFORE);
if (Number.isNaN(cutoff.getTime())) {
  console.error(`Invalid --before value: ${BEFORE}`);
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const iso = cutoff.toISOString();

// Fail early, with a clear message, if the column is not there yet.
const probe = await db.from("applications").select("founding_member").limit(1);
if (probe.error) {
  console.error(
    `Cannot read applications.founding_member: ${probe.error.message}\n` +
      "Apply supabase/migrations/0023_applications_founding_member.sql first.",
  );
  process.exit(1);
}

const count = async (filter) => {
  const { count: n, error } = await filter(
    db.from("applications").select("id", { count: "exact", head: true }),
  );
  if (error) throw error;
  return n ?? 0;
};

const total = await count((q) => q);
const before = await count((q) => q.lt("created_at", iso));
const alreadyMarked = await count((q) => q.eq("founding_member", true));
const toMark = await count((q) => q.lt("created_at", iso).eq("founding_member", false));
const afterCutoffMarked = await count((q) => q.gte("created_at", iso).eq("founding_member", true));

console.log(`Cutoff (created_at strictly before): ${BEFORE}  =  ${iso} UTC`);
console.log(`Applications total:                 ${total}`);
console.log(`Created before cutoff:              ${before}`);
console.log(`Already founding members:           ${alreadyMarked}`);
console.log(`To mark now:                        ${toMark}`);
if (afterCutoffMarked > 0) {
  console.log(
    `Note: ${afterCutoffMarked} application(s) created after the cutoff are already marked. ` +
      "Left as they are; this script never unmarks anyone.",
  );
}

if (!LIVE) {
  console.log("\nDry run. Nothing written. Re-run with --live to apply.");
  process.exit(0);
}

const { data, error } = await db
  .from("applications")
  .update({ founding_member: true })
  .lt("created_at", iso)
  .eq("founding_member", false)
  .select("id");

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

console.log(`\nMarked ${data.length} application(s) as founding members.`);
