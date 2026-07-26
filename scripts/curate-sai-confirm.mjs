/*
  Record the admin readiness confirmations for Sai that the user has authorised
  (2026-07-26). Equivalent to clicking the readiness-panel toggles, done via the
  service-role client with a matching admin_actions audit row per change.

  RECORDED (data-confirmations of his own stated / LinkedIn data + his consent):
    - target role  -> "US Tax Assistant Manager" (confirmed)
    - experience   -> confirmed (start Jun 2022 -> "4 years' US tax experience")
    - compensation basis, structured availability, software -> confirmed
    - candidate publication approval -> recorded (he has approved)

  DELIBERATELY NOT RECORDED (real-world checks the user did NOT confirm as done):
    - identity_verified_at, english_assessed_at/english_level, qualification_verified_at
    These are AccountingTalent verification claims; stamping them un-done would
    fabricate verification results and falsely show "Verified candidate".
    => Publication stays BLOCKED until those three checks are genuinely performed.

  Also clears alternative_target_roles: the previous value was our own unconfirmed
  proposal, and confirming the role would otherwise surface it publicly as fact.

  Run: node scripts/curate-sai-confirm.mjs   (idempotent)
*/
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const actor = process.env.SUPER_ADMIN_EMAIL || "admin-script";
const sb = createClient(url, key, { auth: { persistSession: false } });

const ID = "a662b40b-e9fb-4fab-88a1-d5448344a025";
const now = new Date().toISOString();

const patch = {
  primary_target_role: "US Tax Assistant Manager",
  alternative_target_roles: [], // drop the unconfirmed proposal rather than publish it
  role_confirmed_at: now,
  experience_confirmed_at: now,
  compensation_basis_confirmed_at: now,
  availability_structured_confirmed_at: now,
  software_confirmed_at: now,
  candidate_publication_approved_at: now,
  // Admin-side confirmations done + candidate consented; awaiting AT verification.
  profile_status: "approved",
  // NOT set: identity_verified_at, english_assessed_at, english_level,
  //          qualification_verified_at  (checks not performed).
};

const { data: before } = await sb.from("applications").select("full_name").eq("id", ID).maybeSingle();
if (!before) {
  console.error("No Sai row found for", ID);
  process.exit(1);
}

const { error } = await sb.from("applications").update(patch).eq("id", ID);
if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

// Audit trail, mirroring the server actions' admin_actions inserts.
const audit = [
  { action: "profile_field_confirmed", detail: "field=role confirmed=true value=US Tax Assistant Manager" },
  { action: "profile_field_confirmed", detail: "field=experience confirmed=true" },
  { action: "profile_field_confirmed", detail: "field=compensation_basis confirmed=true" },
  { action: "profile_field_confirmed", detail: "field=availability confirmed=true" },
  { action: "profile_field_confirmed", detail: "field=software confirmed=true" },
  { action: "profile_field_confirmed", detail: "field=candidate_publication confirmed=true" },
  { action: "profile_status_set", detail: "status=approved" },
].map((a) => ({ ...a, application_id: ID, actor }));
await sb.from("admin_actions").insert(audit);

const { data: after } = await sb
  .from("applications")
  .select(
    "full_name, profile_status, primary_target_role, alternative_target_roles, role_confirmed_at, experience_confirmed_at, compensation_basis_confirmed_at, availability_structured_confirmed_at, software_confirmed_at, candidate_publication_approved_at, identity_verified_at, english_assessed_at, english_level, qualification_verified_at",
  )
  .eq("id", ID)
  .maybeSingle();

console.log("Confirmed for", after.full_name, "→ status:", after.profile_status);
console.log(JSON.stringify(after, null, 2));
console.log("\nStill BLOCKING publication (not yet performed — do NOT fabricate):");
console.log("  Identity verified · English communication assessed · Qualification checked");
console.log("Publish only after those three checks are genuinely done and recorded.");
