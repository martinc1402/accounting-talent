/*
  The employer search card's view-model, and the mapping from an applications row
  to it.

  Two rules shape this file:

  1. Graceful fallbacks, never invented data. Several card fields have no backing
     column yet (photo, identity, English level) or only a free-text one (years,
     salary, timezone overlap); see migration 0007. When the structured value is
     missing, the mapping degrades honestly,omit the badge, fall back to the raw
     text, draw a silhouette,rather than fabricating.

  2. The assessment is deliberately NOT shown yet. SHOW_ASSESSMENT gates the
     assessment verification badge and any score. It is false until the assessment
     test itself is trusted; flip it (and pass `assessment`) to light the badge
     back up. No score is rendered while it is off.

  Pure module (no server-only imports) so both the server-side query and the
  client card can import the type and mapping.
*/
import { resolveTargetRole } from "@/lib/candidate/role";

export const SHOW_ASSESSMENT = false;

export type Candidate = {
  id: string;
  name: string;
  /** Target role, e.g. "US Tax Preparer". */
  role: string;
  photo?: { src: string; alt: string };
  /** "CA - India · 6 years' experience" (each part omitted if unknown). */
  qualLine: string;
  /** Resolved verification badge texts. May be empty (renders nothing). */
  verifications: string[];
  /** "Bengaluru, India · Full US shift available" (overlap merged in). */
  locationLine: string;
  availability?: string;
  software: string[];
  /** Role-specific evidence: a label plus chips. items empty => block omitted. */
  evidence: { label: string; items: string[] };
  /** Resolved compensation, or undefined when there's nothing to show. */
  compensation?: { value: string; unit: string };
  /** "Based on up to N hours/week", only when the basis is candidate-confirmed. */
  compensationBasis?: string;
};

/*
  The subset of the applications row (plus the 0007 columns) the card reads. Kept
  local and permissive so the mapping is decoupled from the full DB row type.
*/
export type ApplicationRow = {
  id: string;
  full_name: string;
  role: string;
  // Employer-facing role source (shared with the profile via resolveTargetRole).
  primary_target_role?: string | null;
  role_confirmed_at?: string | null;
  current_seniority?: string | null;
  // Structured compensation basis (0007/0015), so the card matches the profile.
  compensation_currency?: string | null;
  compensation_period?: string | null;
  hours_per_week_basis?: number | null;
  compensation_basis_confirmed_at?: string | null;
  qualification?: string | null;
  city?: string | null;
  state?: string | null;
  availability?: string | null;
  accounting_software?: string[] | null;
  tax_software?: string[] | null;
  tax_forms?: string[] | null;
  // Free-text answers the form already captures.
  experience_years?: string | null;
  salary_expectation?: string | null;
  working_hours?: string | null;
  // Structured columns added in 0007 (null until curated).
  photo_url?: string | null;
  country?: string | null;
  english_level?: string | null;
  identity_verified_at?: string | null;
  role_evidence?: string[] | null;
  experience_years_num?: number | null;
  salary_min_usd?: number | null;
  salary_max_usd?: number | null;
  et_overlap_hours?: number | null;
};

/** The assessment payload,only consumed while SHOW_ASSESSMENT is true. */
export type CandidateAssessment = { name: string; score: number | null };

// Exported so the profile view-model (lib/profile/candidate.ts) reuses the same
// role classification, evidence labels, and formatting rather than drifting.
export type RoleCategory = "tax" | "bookkeeper" | "auditor" | "controller" | "other";

export const EVIDENCE_LABEL: Record<RoleCategory, string> = {
  tax: "US returns prepared",
  bookkeeper: "Core bookkeeping responsibilities",
  auditor: "Audit experience",
  controller: "Reporting and close capabilities",
  other: "Relevant experience",
};

export function roleCategory(role: string): RoleCategory {
  const r = role.toLowerCase();
  if (/tax|1040|1120|1065|preparer|return/.test(r)) return "tax";
  if (/book\s?keep|bookkeeper/.test(r)) return "bookkeeper";
  if (/audit/.test(r)) return "auditor";
  if (/controll|finance manager|reporting/.test(r)) return "controller";
  return "other";
}

export function yearsPhrase(row: ApplicationRow): string | null {
  if (row.experience_years_num != null) {
    const n = row.experience_years_num;
    return `${n} ${n === 1 ? "year" : "years"}' experience`;
  }
  const t = (row.experience_years ?? "").trim();
  if (!t) return null;
  // If the raw answer already reads like a phrase ("3-5 years"), keep it as-is.
  return /year|yr/i.test(t) ? t : `${t} years' experience`;
}

export function overlapPhrase(row: ApplicationRow): string | null {
  // Only a STRUCTURED overlap figure produces an ET-overlap claim. Without one we
  // show nothing, rather than echoing the raw working-hours text — that duplicated
  // the "Preferred hours" line and asserts an overlap we can't validate.
  // "N+ hours" is the minimum guaranteed overlap across US DST (see lib/overlap.ts);
  // single source for Decision Summary, Work Preferences and the search card.
  if (row.et_overlap_hours == null) return null;
  return row.et_overlap_hours >= 8
    ? "Full US shift available"
    : `${row.et_overlap_hours}+ hours ET overlap`;
}

export function compensation(row: ApplicationRow): Candidate["compensation"] {
  const { salary_min_usd: min, salary_max_usd: max } = row;
  if (min != null && max != null) {
    // En dash for the range (house range style). Render sites keep the figure on
    // one line (whitespace-nowrap). Standard display via compensationLine() is
    // "$900–$1,200/month".
    return {
      value: `$${min.toLocaleString("en-US")}–$${max.toLocaleString("en-US")}`,
      unit: `${row.compensation_currency ?? "USD"} / ${row.compensation_period ?? "month"}`,
    };
  }
  const raw = (row.salary_expectation ?? "").trim();
  return raw ? { value: raw, unit: "" } : undefined;
}

/** The single compensation display string: "$900–$1,200/month". Used by the
 *  Decision Summary and search card so the format is defined in one place. */
export function compensationLine(comp: Candidate["compensation"]): string | null {
  if (!comp) return null;
  return comp.unit ? `${comp.value}/month` : comp.value;
}

function verifications(
  row: ApplicationRow,
  assessment?: CandidateAssessment | null,
): string[] {
  const out: string[] = [];
  if (row.identity_verified_at) out.push("Identity verified");
  const eng = (row.english_level ?? "").trim();
  if (eng) out.push(`English: ${eng}`);
  // Assessment badge is intentionally withheld until the test is trusted.
  if (SHOW_ASSESSMENT && assessment) {
    out.push(
      assessment.score != null
        ? `${assessment.name}: ${assessment.score}%`
        : `${assessment.name}: Passed`,
    );
  }
  return out;
}

/** Map one applications row (+ optional assessment) to a card view-model. */
export function applicationToCandidate(
  row: ApplicationRow,
  assessment?: CandidateAssessment | null,
): Candidate {
  const cat = roleCategory(row.role);
  const evidenceItems =
    cat === "tax" ? row.tax_forms ?? [] : row.role_evidence ?? [];

  const place = [row.city, row.country ?? row.state].filter(Boolean).join(", ");
  const overlap = overlapPhrase(row);
  const qualLine = [row.qualification?.trim(), yearsPhrase(row)]
    .filter(Boolean)
    .join(" · ");

  const software = [
    ...new Set([...(row.accounting_software ?? []), ...(row.tax_software ?? [])]),
  ];

  const basisConfirmed = !!(row.compensation_basis_confirmed_at ?? "").toString().trim();
  const compensationBasis =
    basisConfirmed && row.hours_per_week_basis != null
      ? `Based on up to ${row.hours_per_week_basis} hours/week`
      : undefined;

  return {
    id: row.id,
    name: row.full_name,
    // Same employer-facing role source as the profile hero/Decision Summary.
    role: resolveTargetRole(row).value ?? row.role,
    photo: row.photo_url
      ? { src: row.photo_url, alt: `${row.full_name} portrait` }
      : undefined,
    qualLine,
    verifications: verifications(row, assessment),
    locationLine: [place, overlap].filter(Boolean).join(" · "),
    availability: (row.availability ?? "").trim() || undefined,
    software,
    evidence: { label: EVIDENCE_LABEL[cat], items: evidenceItems },
    compensation: compensation(row),
    compensationBasis,
  };
}

/*
  Sample candidates for previewing the card in isolation. Clearly fictional,
  realistic names/credentials, and faithful to the card once the 0007 columns are
  populated (photo, identity, English level, numeric comp). No assessment score is
  present,SHOW_ASSESSMENT stays the single switch for that.
*/
export const sampleCandidates: Candidate[] = [
  {
    id: "sample-arjun",
    name: "Arjun S.",
    role: "US Tax Preparer",
    qualLine: "CA Intermediate, India · 4 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Ahmedabad, India · 4 hours ET overlap",
    availability: "Available within 30 days",
    software: ["QuickBooks Online", "Drake", "Lacerte", "ProConnect", "UltraTax"],
    evidence: {
      label: "US returns prepared",
      items: ["Form 1040", "1120-S", "1065", "Schedule C", "1040-NR"],
    },
    compensation: { value: "$900‑$1,200", unit: "USD / month" },
  },
  {
    id: "sample-priya",
    name: "Priya Ramakrishnan",
    role: "US Tax Preparer",
    qualLine: "CA, India · 6 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Bengaluru, India · Full US shift available",
    availability: "Available within 15 days",
    software: ["ProConnect", "UltraTax", "Drake", "Lacerte"],
    evidence: { label: "US returns prepared", items: ["1120-S", "1065", "1040"] },
    compensation: { value: "$1,100‑$1,500", unit: "USD / month" },
  },
  {
    id: "sample-daniel",
    name: "Daniel O.",
    role: "Bookkeeper",
    qualLine: "B.Com, Philippines · 3 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Manila, Philippines · 6 hours ET overlap",
    availability: "Available immediately",
    software: ["QuickBooks Online", "Xero", "Bill.com"],
    evidence: {
      label: "Core bookkeeping responsibilities",
      items: ["AP / AR", "Bank reconciliations", "Monthly close", "Payroll"],
    },
    compensation: { value: "$700‑$950", unit: "USD / month" },
  },
  {
    id: "sample-meera",
    name: "Meera Krishnamurthy",
    role: "Assistant Controller",
    qualLine: "CPA, India · 8 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Pune, India · 4 hours ET overlap",
    availability: "Available within 30 days",
    software: ["NetSuite", "QuickBooks Online", "Advanced Excel"],
    evidence: {
      label: "Reporting and close capabilities",
      items: ["Month-end close", "GAAP reporting", "Consolidations", "Variance analysis"],
    },
    compensation: { value: "$1,600‑$2,200", unit: "USD / month" },
  },
  {
    id: "sample-rahul",
    name: "Rahul V.",
    role: "US Audit Associate",
    qualLine: "CA, India · 5 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Chennai, India · Full US shift available",
    availability: "Available within 45 days",
    software: ["CaseWare", "TeamMate", "Advanced Excel"],
    evidence: {
      label: "Audit experience",
      items: ["SOX testing", "Substantive testing", "Sampling", "Workpapers"],
    },
    compensation: { value: "$1,200‑$1,600", unit: "USD / month" },
  },
  {
    id: "sample-grace",
    name: "Grace M.",
    role: "Bookkeeper",
    qualLine: "B.Com, Philippines · 2 years' experience",
    verifications: ["Identity verified", "English: Advanced"],
    locationLine: "Cebu, Philippines · 5 hours ET overlap",
    availability: "Available immediately",
    software: ["Xero", "QuickBooks Online", "Gusto"],
    evidence: {
      label: "Core bookkeeping responsibilities",
      items: ["AP / AR", "Reconciliations", "Reporting"],
    },
    compensation: { value: "$650‑$900", unit: "USD / month" },
  },
];
