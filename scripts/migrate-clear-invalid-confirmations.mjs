// One-off migration for the section-confirmation-requires-its-fields change.
//
//   node --env-file=.env.local scripts/migrate-clear-invalid-confirmations.mjs         # dry run (default)
//   node --env-file=.env.local scripts/migrate-clear-invalid-confirmations.mjs --live  # apply
//
// Confirming a section now REQUIRES its fields (app/actions.ts):
//   - Availability: avail_days (≥1) + avail_start_time + avail_finish_time +
//     timezone + avail_max_weekly_hours.
//   - Software: every product needs a level AND years.
// Any row already stamped "confirmed" but missing those fields is a stale
// confirmation from before the rule. This clears the offending timestamp so the
// dashboard badge derives back to "Needs your confirmation" — it NEVER edits the
// candidate's actual data, only the confirmation stamp.
//
// Standalone (not lib/supabase.ts, which is server-only) — same service-role
// client from the same env vars as the other scripts.

import { createClient } from "@supabase/supabase-js";

const LIVE = process.argv.includes("--live");

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local)");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const has = (v) => v != null && String(v).trim() !== "";

// Availability is complete only when ALL required fields are present.
function availabilityComplete(row) {
  return (
    Array.isArray(row.avail_days) &&
    row.avail_days.length >= 1 &&
    has(row.avail_start_time) &&
    has(row.avail_finish_time) &&
    has(row.timezone) &&
    row.avail_max_weekly_hours != null
  );
}

// Software is complete only when EVERY listed product has a level and years.
function softwareComplete(row) {
  const list = Array.isArray(row.software_proficiency) ? row.software_proficiency : [];
  if (list.length === 0) return false;
  return list.every((s) => has(s?.level) && s?.years != null);
}

async function main() {
  const { data: rows, error } = await db
    .from("applications")
    .select(
      "id, full_name, availability_structured_confirmed_at, software_confirmed_at, avail_days, avail_start_time, avail_finish_time, timezone, avail_max_weekly_hours, software_proficiency",
    );
  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  const availOffenders = rows.filter(
    (r) => has(r.availability_structured_confirmed_at) && !availabilityComplete(r),
  );
  const swOffenders = rows.filter((r) => has(r.software_confirmed_at) && !softwareComplete(r));

  console.log(`Scanned ${rows.length} applications.`);
  console.log(`\nAvailability confirmations to clear: ${availOffenders.length}`);
  for (const r of availOffenders) {
    const missing = [
      !(Array.isArray(r.avail_days) && r.avail_days.length) && "days",
      !has(r.avail_start_time) && "start",
      !has(r.avail_finish_time) && "finish",
      !has(r.timezone) && "timezone",
      r.avail_max_weekly_hours == null && "maxHours",
    ].filter(Boolean);
    console.log(`  - ${r.full_name} (${r.id}) — missing: ${missing.join(", ")}`);
  }
  console.log(`\nSoftware confirmations to clear: ${swOffenders.length}`);
  for (const r of swOffenders) {
    console.log(`  - ${r.full_name} (${r.id})`);
  }

  if (!LIVE) {
    console.log("\nDry run — no changes written. Re-run with --live to apply.");
    return;
  }

  let cleared = 0;
  for (const r of availOffenders) {
    const { error: e } = await db
      .from("applications")
      .update({ availability_structured_confirmed_at: null })
      .eq("id", r.id);
    if (e) console.error(`  ! availability ${r.id}: ${e.message}`);
    else cleared++;
  }
  for (const r of swOffenders) {
    const { error: e } = await db
      .from("applications")
      .update({ software_confirmed_at: null })
      .eq("id", r.id);
    if (e) console.error(`  ! software ${r.id}: ${e.message}`);
    else cleared++;
  }
  console.log(`\nApplied. Cleared ${cleared} confirmation timestamp(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
