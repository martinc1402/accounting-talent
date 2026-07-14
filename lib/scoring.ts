import type { Answers } from "@/content/form";

/*
  Routing logic from stage1-application-form-spec.md.

  fast_track  Stage 2 within 24 hours. The premium inventory: already trained
              on US standards, currently earning a fraction of what the agency
              bills for them.
  standard    Stage 2 within 3 days.
  waitlist    Polite hold. Not a rejection: these people are future supply.
  filter_out  Auto-archive on expectation mismatch.

  Email-verification timeout and duplicate WhatsApp numbers are also
  filter_out conditions in the spec, but those are enforced downstream once
  verification ships, not here.
*/
export type Tier = "fast_track" | "standard" | "waitlist" | "filter_out";

const HAS_US_CLIENTS = [
  "Yes, I currently work on US clients",
  "Yes, I have in the past",
];

/** Software that a US firm would actually recognise on a profile. */
const REAL_US_PACKAGES = [
  "QuickBooks Online",
  "QuickBooks Desktop",
  "Xero",
  "NetSuite",
  "Sage",
  "Zoho Books",
  "Drake",
  "Lacerte",
  "ProConnect",
  "UltraTax CS",
  "CCH Axcess / ProSystem fx",
  "ProSeries",
];

/** Salary bands at or below $1,800/month. */
const SALARY_AT_OR_BELOW_1800 = [
  "$300 to $500",
  "$500 to $800",
  "$800 to $1,200",
  "$1,200 to $1,800",
];

const SALARY_AT_OR_ABOVE_1200 = [
  "$1,200 to $1,800",
  "$1,800 to $2,500",
  "Above $2,500",
];

const TRAINABLE_QUALIFICATIONS = [
  "Chartered Accountant (ICAI member)",
  "CA Final student / CA Inter cleared",
  "CMA (ICMAI or US CMA)",
  "ACCA",
  "M.Com / MBA Finance",
];

const WEAK_QUALIFICATIONS = ["B.Com", "Other / none of these"];

const OWN_COMPUTER = "Own laptop or desktop (not shared, not mobile-only)";

const list = (v: Answers[string]): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

export function scoreApplication(a: Answers): Tier {
  const software = [
    ...list(a.accounting_software),
    ...list(a.tax_software),
  ];
  const hasRealPackage = software.some((s) => REAL_US_PACKAGES.includes(s));
  const usExperience = HAS_US_CLIENTS.includes(String(a.us_experience ?? ""));
  const salary = String(a.salary_expectation ?? "");
  const qualification = String(a.qualification ?? "");
  const years = String(a.experience_years ?? "");
  const setup = list(a.home_setup);

  // Expectation mismatch: junior, weakest qualification, senior salary ask.
  if (
    years === "Less than 1 year" &&
    WEAK_QUALIFICATIONS.includes(qualification) &&
    SALARY_AT_OR_ABOVE_1200.includes(salary)
  ) {
    return "filter_out";
  }

  // No own computer is a hard hold regardless of how good the profile is.
  if (!setup.includes(OWN_COMPUTER)) return "waitlist";

  if (usExperience && hasRealPackage && SALARY_AT_OR_BELOW_1800.includes(salary)) {
    return "fast_track";
  }

  // Tally-only or nothing, and no foreign-client exposure: trainable pipeline.
  if (!hasRealPackage && a.us_experience === "No") return "waitlist";

  // Trainable, honest and affordable: strong fundamentals, no US exposure yet.
  if (
    TRAINABLE_QUALIFICATIONS.includes(qualification) &&
    years !== "Less than 1 year"
  ) {
    return "standard";
  }

  return "standard";
}
