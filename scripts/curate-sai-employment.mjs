/*
  Populate Sai's employment history + US-tax experience start from his own public
  LinkedIn profile (candidate-provided; nothing invented). This clears the last
  publication blocker (>=1 employment-history entry). Confirmations are NOT stamped
  — the data is populated and left for an admin to confirm via the readiness panel.

  Anonymity: employer_public holds a generalized label; employer_private holds the
  real firm name (a stored record). The projection (lib/authz/projectCandidate.ts)
  withholds the employer from every non-admin viewer regardless, so titles/dates/
  bullets show publicly but the firm name does not.

  Run AFTER 0015: node scripts/curate-sai-employment.mjs   (idempotent)
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
  // From LinkedIn (candidate-provided). Real firm names in employer_private only.
  employment_history: [
    {
      title: "US Tax — Associate to Assistant Manager",
      employer_public: "US tax & advisory firm · Gurugram, India",
      employer_private: "AKM Global",
      dates: "Jun 2022 to Present",
      current: true,
      source_type: "candidate_provided",
      // Grounded in his own About + LinkedIn role titles — not invented.
      responsibilities: [
        "Prepared and reviewed US federal and multi-state partnership (1065) and corporate (1120 / 1120-S) tax returns for CPA-firm clients.",
        "Progressed from Associate to Senior Associate to Assistant Manager, serving as a trusted point of contact for clients.",
      ],
      exposure: "US federal & multi-state · partnership and corporate tax",
    },
    {
      title: "Analyst (Seasonal) — US Tax",
      employer_public: "US CPA advisory services (seasonal) · India",
      employer_private: "CohnReznick Professional Services Pvt Ltd",
      dates: "Dec 2021 to Apr 2022",
      current: false,
      source_type: "candidate_provided",
    },
  ],

  // Continuous US-tax work from the AKM full-time start (Jun 2022). Populated but
  // UNCONFIRMED: experience_confirmed_at stays null, so the public label remains
  // the "3–5 years" range until an admin confirms it (then it reads "4 years").
  us_tax_experience_start_date: "2022-06-01",
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

const { data: after } = await sb
  .from("applications")
  .select("full_name, employment_history, us_tax_experience_start_date, experience_confirmed_at")
  .eq("id", ID)
  .maybeSingle();

console.log("Updated", after.full_name);
console.log(JSON.stringify(after, null, 2));
console.log("\nEmployment history captured -> the last DATA blocker is cleared.");
console.log("Still unconfirmed (admin readiness toggles + AT checks): role, experience,");
console.log("compensation basis, availability, software, education, candidate publication,");
console.log("and identity / English / qualification checks.");
