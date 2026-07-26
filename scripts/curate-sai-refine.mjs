/*
  Final-refinement curation for Sai (2026-07-26). Candidate-provided data only —
  nothing invented. Run AFTER applying 0016_current_seniority.sql:
    node scripts/curate-sai-refine.mjs   (idempotent)

  Changes:
   - Public primary role -> "Senior US Tax Reviewer" (employer-facing), with
     "Assistant Manager" retained as current_seniority; alternative "Senior US Tax
     Associate". Role stays confirmed (admin-approved).
   - Canonical professional summary (canonical software names; states current level;
     immediate part-time up to 20h/week).
   - Employment employer_public cleaned to location/name-free descriptors.
   - Education seeded as a structured degree entry (completion/institution/year/field
     left blank -> flagged for confirmation; public shows "B.Com" only).

  Left UNSET / flagged (do not invent): avail_days, avail_start_time,
  avail_finish_time, software level/years/last_used, education completion_status/
  institution/year/field_of_study, avail_busy_season_flexible.
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

const summary =
  "Sai is a senior US tax reviewer with four years of experience preparing and " +
  "reviewing US entity returns, including Forms 1120, 1120-S and 1065. Currently " +
  "working at Assistant Manager level in US tax, he has hands-on experience with " +
  "CCH Axcess Tax, CCH ProSystem fx Tax and GoSystem Tax RS. He is comfortable " +
  "reviewing multi-state, multi-shareholder S-corporation and partnership returns " +
  "involving state apportionment and K-1 allocations. Sai is available immediately " +
  "for part-time work of up to 20 hours per week.";

const patch = {
  primary_target_role: "Senior US Tax Reviewer",
  current_seniority: "Assistant Manager",
  alternative_target_roles: ["Senior US Tax Associate"],
  role_confirmed_at: now,
  professional_summary: summary,
  education: [{ degree: "B.Com" }], // completion/institution/year/field flagged (unset)
  employment_history: [
    {
      title: "US Tax — Associate to Assistant Manager",
      employer_public: "Offshore US accounting firm", // location/name-free descriptor
      employer_private: "AKM Global",
      dates: "Jun 2022 to Present",
      current: true,
      source_type: "candidate_provided",
      responsibilities: [
        "Prepared and reviewed US federal and multi-state partnership (1065) and corporate (1120 / 1120-S) tax returns for CPA-firm clients.",
        "Progressed from Associate to Senior Associate to Assistant Manager, serving as a trusted point of contact for clients.",
      ],
      exposure: "US federal & multi-state · partnership and corporate tax",
    },
    {
      title: "Analyst (Seasonal) — US Tax",
      employer_public: "US CPA advisory firm (seasonal)",
      employer_private: "CohnReznick Professional Services Pvt Ltd",
      dates: "Dec 2021 to Apr 2022",
      current: false,
      source_type: "candidate_provided",
    },
  ],
};

const { data: before } = await sb.from("applications").select("full_name").eq("id", ID).maybeSingle();
if (!before) {
  console.error("No Sai row found for", ID);
  process.exit(1);
}

const { error } = await sb.from("applications").update(patch).eq("id", ID);
if (error) {
  console.error("Update failed (did you apply 0016_current_seniority.sql?):", error.message);
  process.exit(1);
}

await sb.from("admin_actions").insert({
  action: "profile_refined",
  application_id: ID,
  detail: "primary role -> Senior US Tax Reviewer; current_seniority Assistant Manager; canonical summary; clean employer_public; structured education",
  actor,
});

const { data: after } = await sb
  .from("applications")
  .select("full_name, primary_target_role, current_seniority, alternative_target_roles, role_confirmed_at, education, employment_history")
  .eq("id", ID)
  .maybeSingle();

console.log("Refined", after.full_name);
console.log(JSON.stringify(after, null, 2));
console.log("\nStill needs Sai's confirmation (flagged, not invented):");
console.log("  available days · preferred start/finish times · education completion+institution+year+field ·");
console.log("  software level/years/last-used · busy-season flexibility. Plus AT checks (identity/English/qualification).");
