/*
  Curate Sai Swaminathan Ramji's candidate profile from his OWN application +
  assessment answers only. Nothing here is invented: every value below is traceable
  to a field he submitted or a statement in his assessment (see the comment on each).
  No *_confirmed_at / *_verified_at timestamps are stamped — so the public profile
  presents nothing as confirmed fact, and the profile stays a DRAFT (unpublishable
  until an admin confirms fields, records the AT checks, and adds employment history).

  Run AFTER applying supabase/migrations/0015_profile_readiness_and_structure.sql:
    node scripts/curate-sai.mjs
  Idempotent — safe to re-run.
*/
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const ID = "a662b40b-e9fb-4fab-88a1-d5448344a025";

const patch = {
  // Draft until fully ready. Sai's public route 404s in this state (by design).
  profile_status: "draft",

  // Role: PROPOSED canonical wording, left UNCONFIRMED (role_confirmed_at stays null),
  // so the public page keeps showing his raw "Tax Reviewer / Senior Tax".
  primary_target_role: "Senior US Tax Reviewer",
  alternative_target_roles: ["Senior US Tax Associate"],

  // Compensation basis: he stated "up to 20 hrs/week" and "$1,800 to $2,500".
  // salary_min/max_usd already hold 1800/2500. Basis stays UNCONFIRMED -> no public
  // "Based on up to 20 hours/week" line yet, and publication stays blocked.
  hours_per_week_basis: 20,

  // Availability: "Part-time (up to 20 hrs/week)", finish "~9-10 pm IST", tz set.
  // He gave NO start time, so we leave start/finish blank — ET overlap is NOT
  // computed or fabricated. Structured availability stays UNCONFIRMED.
  avail_max_weekly_hours: 20,

  // Proof points — all candidate_provided, UNCONFIRMED, straight from his answers:
  //  - forms he listed (tax_forms); 60 shareholders + 10-15 states from his assessment.
  proof_points: [
    { value: "1120, 1120-S & 1065", label: "US entity return experience", source_type: "candidate_provided", display_order: 1, is_public: true },
    { value: "60 shareholders", label: "Complex S-corporation handled", source_type: "candidate_provided", display_order: 2, is_public: true },
    { value: "10–15 states", label: "Multi-state return experience", source_type: "candidate_provided", display_order: 3, is_public: true },
  ],

  // Software — canonical names for the products he named (tax_software "CCH Axcess /
  // ProSystem fx", plus "GoSystems" in his summary & assessment). No level/years
  // invented; not candidate-confirmed.
  software_proficiency: [
    { name: "CCH Axcess Tax", confirmed_by_candidate: false },
    { name: "CCH ProSystem fx Tax", confirmed_by_candidate: false },
    { name: "GoSystem Tax RS", confirmed_by_candidate: false },
  ],

  // Return types he listed (mode prepared/reviewed unknown -> omitted, not guessed).
  return_experience: [
    { form: "Form 1120" },
    { form: "Form 1120-S" },
    { form: "Form 1065" },
  ],

  // Deliberately NOT set (each blocks publication until real):
  //   employment_history (none provided), education structured (only "B.Com" known),
  //   identity/english/qualification checks, and every *_confirmed_at timestamp.
};

const { data: before } = await sb.from("applications").select("id,full_name,profile_status").eq("id", ID).maybeSingle();
if (!before) {
  console.error("No Sai row found for", ID);
  process.exit(1);
}

const { error } = await sb.from("applications").update(patch).eq("id", ID);
if (error) {
  console.error("Update failed (did you apply migration 0015?):", error.message);
  process.exit(1);
}

const { data: after } = await sb
  .from("applications")
  .select("full_name,profile_status,primary_target_role,alternative_target_roles,hours_per_week_basis,avail_max_weekly_hours,proof_points,software_proficiency,return_experience,employment_history,role_confirmed_at,compensation_basis_confirmed_at,identity_verified_at,candidate_publication_approved_at")
  .eq("id", ID)
  .maybeSingle();

console.log("Curated", after.full_name, "→ profile_status:", after.profile_status);
console.log(JSON.stringify(after, null, 2));
console.log(
  "\nStill UNCONFIRMED / blocking publication (needs admin/candidate action):\n" +
    "  role wording, compensation basis, structured availability, software, education,\n" +
    "  candidate publication approval, identity / English / qualification checks,\n" +
    "  and at least one employment-history entry (none provided).",
);
