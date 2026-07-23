/*
  The full profile page's view-model, and the mapping from an applications row
  (+ its assessment) to it. Companion to lib/search/candidate.ts (the card).

  Same two rules as the card: graceful fallbacks, never invented data; and the
  assessment stays hidden behind SHOW_ASSESSMENT. Everything the profile shows
  beyond the card is backed by the 0008 columns, and every such section is
  OMITTED when its source is null, so a sparse real candidate renders cleanly
  rather than showing empty scaffolding.

  Pure module (no server-only imports): the server route builds the row, this
  maps it, the server components render it. Reuses the card's role classification
  and formatting helpers so the two surfaces cannot drift.
*/

import {
  type ApplicationRow,
  type RoleCategory,
  SHOW_ASSESSMENT,
  compensation,
  overlapPhrase,
  roleCategory,
  yearsPhrase,
} from "@/lib/search/candidate";

// Title + one-line subtitle for the role-specific capabilities card, keyed by
// the same role category the card uses for its evidence label.
const CAPABILITY_META: Record<RoleCategory, { title: string; subtitle: string }> = {
  tax: {
    title: "US returns prepared",
    subtitle: "Federal and state returns this candidate has hands-on experience preparing.",
  },
  bookkeeper: {
    title: "Core bookkeeping responsibilities",
    subtitle: "Day-to-day bookkeeping handled independently.",
  },
  auditor: {
    title: "Audit experience",
    subtitle: "Audit stages and testing this candidate has performed.",
  },
  controller: {
    title: "Reporting and close capabilities",
    subtitle: "Close, reporting and oversight responsibilities owned.",
  },
  other: { title: "Relevant experience", subtitle: "" },
};

import type { IntroductionStatus, VisibilityLevel } from "@/lib/authz/types";

export type ProfileStat = { value: string; label: string };

/** Identity/contact, present in the view-model ONLY at accepted-introduction or
 *  admin level. Absent (undefined) at every lower level — never masked. */
export type CandidateContact = {
  fullName: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  resumeUrl?: string;
};

/** The Request-introduction CTA state, decided server-side. */
export type ProfileCtaState =
  | { kind: "register" }
  | { kind: "verify" }
  | { kind: "request" }
  | { kind: "at_limit" }
  | { kind: "status"; status: IntroductionStatus }
  | { kind: "accepted" }
  | { kind: "preview" };

/** Access/entitlement metadata attached to the projected view-model so the UI can
 *  render the right CTA and paid-feature slots without re-deriving permissions. */
export type ProfileAccess = {
  level: VisibilityLevel;
  isPreview: boolean;
  /** True when the real viewer is an admin (drives the preview switcher UI). */
  adminControls: boolean;
  cta: ProfileCtaState;
  /** True when compensation is withheld and a registration CTA is shown instead. */
  compensationLocked: boolean;
  paidFeatures: {
    assessmentBreakdown: boolean;
    resumeDownload: boolean;
  };
};
/** A verification badge's label derives from the check STATE, not free text:
 *  binary pass checks read "Verified"; leveled checks read their level. */
export type VerificationBadge = { kind: "verified" } | { kind: "level"; level: string };
export type ProfileVerification = {
  label: string;
  badge: VerificationBadge;
  detail: string;
  // Independently-verified date, surfaced only when the gating timestamp exists.
  date?: string;
};
export type ProfileHistoryEntry = {
  title: string;
  meta: string;
  dates: string;
  bullets: string[];
  exposure?: string;
};
export type ProfileEducationEntry = {
  qualification: string;
  meta?: string;
  status?: string;
  completed?: boolean;
  note?: string;
};
export type ProfileSoftware = { name: string; meta?: string };
export type ProfileFact = { label: string; value: string };

export type CandidateProfile = {
  id: string;
  eyebrow: string;
  name: string;
  initials: string;
  role: string;
  photo?: { src: string; alt: string; focal?: string };
  qualLine: string;
  heroVerifications: string[];
  // Scannable, candidate-supplied proof points (e.g. "300+" / "US returns / season").
  evidence?: ProfileStat[];
  location?: string;
  overlap?: string;
  availability?: string;
  compensation?: { value: string; unit: string };
  summary?: string;
  writingSample?: { text: string; attribution: string };
  capabilities?: { title: string; subtitle: string; primary: string[]; extra: string[] };
  software: ProfileSoftware[];
  verifications: ProfileVerification[];
  history: ProfileHistoryEntry[];
  education: ProfileEducationEntry[];
  preferences: ProfileFact[];
  decision: ProfileFact[];
  // Present only at accepted-introduction / admin (see projectProfileView).
  contact?: CandidateContact;
  // Attached by the projection so the client renders the right CTA/paid slots.
  access?: ProfileAccess;
};

// jsonb column shapes (0008). Read whole with the row; loosely typed and coerced.
type EmploymentJson = {
  title?: string;
  employer?: string;
  dates?: string;
  bullets?: string[];
  exposure?: string;
};
type EducationJson = {
  qualification?: string;
  institution?: string;
  year?: string | number;
  status?: string;
  completed?: boolean;
  note?: string;
};
type SoftwareJson = { name?: string; level?: string; years?: number };

export type ProfileRow = ApplicationRow & {
  start_date?: string | null;
  professional_summary?: string | null;
  // Curated proof points, same jsonb pattern as the other 0008 columns.
  highlights?: { value?: string; label?: string }[] | null;
  employment_history?: EmploymentJson[] | null;
  education?: EducationJson[] | null;
  employment_type?: string | null;
  engagement?: string | null;
  willing_full_shift?: boolean | null;
  software_proficiency?: SoftwareJson[] | null;
  qualification_verified_at?: string | null;
  // 0010 polish fields.
  experience_focus?: string | null; // e.g. "US tax" -> "4 years' US tax experience"
  english_assessed_at?: string | null;
  photo_focal?: string | null; // CSS object-position, e.g. "center 20%"
};

/** The assessment payload for a profile: score is still gated by SHOW_ASSESSMENT;
 *  writingSample is the candidate's own words, shown regardless. */
export type ProfileAssessment = {
  name: string;
  score: number | null;
  writingSample?: string | null;
};

/** A verification timestamp formatted as an understated "Mon YYYY", or undefined. */
function verifiedDate(ts?: string | null): string | undefined {
  const t = (ts ?? "").trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** The hero experience line, with an optional role-specific focus injected.
 *  "4 years' experience" + focus "US tax" -> "4 years' US tax experience".
 *  yearsPhrase (shared with the card) stays generic; the focus is profile-only. */
function experiencePhrase(row: ProfileRow): string | null {
  const base = yearsPhrase(row);
  if (!base) return null;
  const focus = (row.experience_focus ?? "").trim();
  if (!focus) return base;
  return base.includes("experience")
    ? base.replace("experience", `${focus} experience`)
    : `${base}, ${focus}`;
}

/** Coerce the loosely-typed highlights column into proof-point stats. */
function evidence(row: ProfileRow): ProfileStat[] | undefined {
  const out = (row.highlights ?? [])
    .filter((h) => h?.value?.trim() && h?.label?.trim())
    .map((h) => ({ value: (h.value as string).trim(), label: (h.label as string).trim() }));
  return out.length ? out : undefined;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function heroVerifications(row: ProfileRow, assessment?: ProfileAssessment | null): string[] {
  const out: string[] = [];
  if (row.identity_verified_at) out.push("Identity verified");
  const eng = (row.english_level ?? "").trim();
  if (eng) out.push(`English: ${eng}`);
  if (SHOW_ASSESSMENT && assessment) {
    out.push(assessment.score != null ? `${assessment.name}: ${assessment.score}%` : `${assessment.name}: Passed`);
  }
  return out;
}

function capabilities(row: ProfileRow): CandidateProfile["capabilities"] {
  const cat = roleCategory(row.role);
  const items = cat === "tax" ? row.tax_forms ?? [] : row.role_evidence ?? [];
  if (!items.length) return undefined;
  const meta = CAPABILITY_META[cat];
  return { title: meta.title, subtitle: meta.subtitle, primary: items.slice(0, 3), extra: items.slice(3) };
}

function software(row: ProfileRow): ProfileSoftware[] {
  const prof = row.software_proficiency;
  if (prof && prof.length) {
    return prof
      .filter((s) => s?.name)
      .map((s) => {
        const bits = [
          s.level?.trim(),
          s.years != null ? `${s.years} yr${s.years === 1 ? "" : "s"}` : null,
        ].filter(Boolean);
        return { name: s.name as string, meta: bits.length ? bits.join(" · ") : undefined };
      });
  }
  const names = [...new Set([...(row.accounting_software ?? []), ...(row.tax_software ?? [])])];
  return names.map((name) => ({ name }));
}

function verifications(row: ProfileRow, assessment?: ProfileAssessment | null): ProfileVerification[] {
  const out: ProfileVerification[] = [];
  if (row.identity_verified_at) {
    out.push({
      label: "Identity verified",
      badge: { kind: "verified" },
      detail: "Government-issued photo ID verified.",
      date: verifiedDate(row.identity_verified_at),
    });
  }
  const eng = (row.english_level ?? "").trim();
  if (eng) {
    out.push({
      label: "English communication",
      badge: { kind: "level", level: eng },
      detail: "Assessed for written and spoken business English.",
      date: verifiedDate(row.english_assessed_at),
    });
  }
  // Assessment row withheld until the test is trusted (SHOW_ASSESSMENT).
  if (SHOW_ASSESSMENT && assessment) {
    out.push({
      label: assessment.name,
      badge: { kind: "level", level: assessment.score != null ? `${assessment.score}%` : "Passed" },
      detail: "Scenario-based skills assessment.",
    });
  }
  if (row.qualification_verified_at) {
    out.push({
      label: "Qualification checked",
      badge: { kind: "verified" },
      detail: "Confirmed with the issuing institution.",
      date: verifiedDate(row.qualification_verified_at),
    });
  }
  return out;
}

function history(row: ProfileRow): ProfileHistoryEntry[] {
  const h = row.employment_history;
  if (!h?.length) return [];
  return h
    .filter((j) => j?.title)
    .map((j) => ({
      title: j.title as string,
      meta: (j.employer ?? "").trim(),
      dates: (j.dates ?? "").trim(),
      bullets: j.bullets ?? [],
      exposure: j.exposure?.trim() || undefined,
    }));
}

function education(row: ProfileRow): ProfileEducationEntry[] {
  const e = row.education;
  if (e?.length) {
    return e
      .filter((x) => x?.qualification)
      .map((x) => ({
        qualification: x.qualification as string,
        meta: [x.institution, x.year].filter(Boolean).join(" · ") || undefined,
        status: x.status?.trim() || undefined,
        completed: x.completed,
        note: x.note?.trim() || undefined,
      }));
  }
  // Fallback: the single free-text qualification the form does capture.
  const q = (row.qualification ?? "").trim();
  return q ? [{ qualification: q }] : [];
}

function preferences(row: ProfileRow): ProfileFact[] {
  const overlap = overlapPhrase(row);
  const entries: [string, string][] = [
    ["Employment", (row.employment_type ?? "").trim()],
    ["Earliest start", (row.start_date ?? "").trim()],
    ["Preferred hours", (row.working_hours ?? "").trim()],
    ["US overlap", overlap ?? ""],
    ["Full US shift", row.willing_full_shift ? "Willing to work a full US shift" : ""],
    ["Engagement", (row.engagement ?? "").trim()],
  ];
  return entries.filter(([, v]) => v).map(([label, value]) => ({ label, value }));
}

/** Map an applications row (+ its assessment) to the full profile view-model. */
export function applicationToProfile(
  row: ProfileRow,
  assessment?: ProfileAssessment | null,
): CandidateProfile {
  const comp = compensation(row);
  const overlap = overlapPhrase(row) ?? undefined;
  const availability = (row.availability ?? "").trim() || undefined;
  const employmentType = (row.employment_type ?? "").trim();
  const location = [row.city, row.country ?? row.state].filter(Boolean).join(", ") || undefined;

  const decision: ProfileFact[] = [{ label: "Target role", value: row.role }];
  if (comp) decision.push({ label: "Compensation", value: comp.unit ? `${comp.value} /mo` : comp.value });
  if (availability) decision.push({ label: "Availability", value: availability });
  if (overlap) decision.push({ label: "US overlap", value: overlap });
  if (employmentType) decision.push({ label: "Preference", value: employmentType });

  const qualLine = [row.qualification?.trim(), experiencePhrase(row)].filter(Boolean).join(" · ");
  const ws = (assessment?.writingSample ?? "").trim();

  return {
    id: row.id,
    eyebrow: "Verified candidate",
    name: row.full_name,
    initials: initialsOf(row.full_name),
    role: row.role,
    photo: row.photo_url
      ? {
          src: row.photo_url,
          alt: `${row.full_name}, ${row.role}`,
          focal: (row.photo_focal ?? "").trim() || undefined,
        }
      : undefined,
    qualLine,
    heroVerifications: heroVerifications(row, assessment),
    evidence: evidence(row),
    location,
    overlap,
    availability,
    compensation: comp,
    summary: (row.professional_summary ?? "").trim() || undefined,
    writingSample: ws
      ? { text: ws, attribution: "Written during the AccountingTalent skills assessment · unedited" }
      : undefined,
    capabilities: capabilities(row),
    software: software(row),
    verifications: verifications(row, assessment),
    history: history(row),
    education: education(row),
    preferences: preferences(row),
    decision,
  };
}

/*
  Sample profiles for previewing the page in isolation (clearly fictional). Fully
  populated so the preview exercises every section; faithful to the design's two
  candidates, minus the assessment score (SHOW_ASSESSMENT is off) and with neutral
  verification detail lines.
*/
export const sampleProfiles: CandidateProfile[] = [
  {
    id: "sample-arjun",
    eyebrow: "Verified candidate",
    name: "Priya S.",
    initials: "PS",
    role: "US Tax Preparer",
    photo: {
      src: "/images/candidate-headshot.jpg",
      alt: "Priya S., US Tax Preparer",
      focal: "center 20%",
    },
    qualLine: "CA Intermediate, India · 4 years' US tax experience",
    heroVerifications: ["Identity verified", "English: Advanced"],
    evidence: [
      { value: "300+", label: "US returns / season" },
      { value: "40+", label: "clients managed" },
      { value: "4", label: "tax seasons" },
    ],
    location: "Ahmedabad, India",
    overlap: "4 hours ET overlap",
    availability: "Available within 30 days",
    compensation: { value: "$900‑$1,200", unit: "USD / month" },
    summary:
      "Priya is a US tax preparer with four busy seasons preparing federal and multi-state returns for an outsourced US CPA firm. She owns a book of 40+ small-business and individual clients end to end in Drake and Lacerte, from workpaper prep through review-ready filing, and is strongest on 1040, 1120-S and 1065 engagements.",
    writingSample: {
      text: "A client came to us mid-season with two years of unfiled 1120-S returns and no clean workpapers. I rebuilt the trial balances from the bank feeds in QuickBooks, reconciled the shareholder basis, and got both years filed before the extended deadline. The owner had assumed the penalties were unavoidable; we abated most of them with a reasonable-cause letter.",
      attribution: "Written during the AccountingTalent skills assessment · unedited",
    },
    capabilities: {
      title: "US returns prepared",
      subtitle: "Federal and state returns this candidate has hands-on experience preparing.",
      primary: ["Form 1040", "Form 1120-S", "Form 1065"],
      extra: ["Schedule C", "Form 1040-NR", "Multi-state returns"],
    },
    software: [
      { name: "QuickBooks Online", meta: "Advanced · 4 yrs" },
      { name: "Drake", meta: "Advanced · 4 yrs" },
      { name: "Lacerte", meta: "Intermediate · 2 yrs" },
    ],
    verifications: [
      { label: "Identity verified", badge: { kind: "verified" }, detail: "Government-issued photo ID verified.", date: "Mar 2026" },
      { label: "English communication", badge: { kind: "level", level: "Advanced" }, detail: "Assessed for written and spoken business English.", date: "Feb 2026" },
      { label: "Qualification checked", badge: { kind: "verified" }, detail: "CA Intermediate confirmed with the issuing institution.", date: "Feb 2026" },
    ],
    history: [
      {
        title: "Senior Tax Associate",
        meta: "Outsourced US CPA firm · Remote (Ahmedabad, India)",
        dates: "Jan 2022 to Present",
        bullets: [
          "Prepared 300+ US federal and multi-state returns per season (1040, 1120-S, 1065).",
          "Owns a book of 40+ SMB and individual clients end to end in Drake and Lacerte.",
          "Cut reviewer notes by about 30% with a standardized workpaper checklist.",
        ],
        exposure: "US federal and multi-state individual and business returns",
      },
      {
        title: "Accounts Executive",
        meta: "Regional accounting firm · Ahmedabad, India",
        dates: "Jun 2020 to Dec 2021",
        bullets: [
          "Managed bookkeeping and GST filings for 15 domestic clients.",
          "Supported year-end finalization and audit schedule preparation.",
        ],
      },
    ],
    education: [
      {
        qualification: "CA Intermediate",
        meta: "ICAI · India",
        status: "In progress",
        completed: false,
        note: "Both groups cleared; currently pursuing CA Final.",
      },
      { qualification: "B.Com (Accounting & Finance)", meta: "Gujarat University · 2020", status: "Completed", completed: true },
      { qualification: "QuickBooks Online ProAdvisor", meta: "Intuit · 2023", status: "Certified", completed: true },
    ],
    preferences: [
      { label: "Employment", value: "Full-time" },
      { label: "Earliest start", value: "Within 30 days" },
      { label: "Preferred hours", value: "12:00 to 8:00 PM IST" },
      { label: "US overlap", value: "4 hours ET overlap" },
      { label: "Full US shift", value: "Willing to work a full US shift" },
      { label: "Engagement", value: "Employer of record / contractor" },
    ],
    decision: [
      { label: "Target role", value: "US Tax Preparer" },
      { label: "Compensation", value: "$900‑$1,200 /mo" },
      { label: "Availability", value: "Available within 30 days" },
      { label: "US overlap", value: "4 hours ET overlap" },
      { label: "Preference", value: "Full-time" },
    ],
  },
  {
    id: "sample-daniel",
    eyebrow: "Verified candidate",
    name: "Daniel O.",
    initials: "DO",
    role: "Bookkeeper",
    qualLine: "B.Com, Philippines · 3 years' experience",
    heroVerifications: ["Identity verified", "English: Advanced"],
    evidence: [
      { value: "12", label: "SMB clients closed" },
      { value: "30+", label: "accounts reconciled / mo" },
      { value: "3", label: "years remote US" },
    ],
    location: "Manila, Philippines",
    overlap: "6 hours ET overlap",
    availability: "Available immediately",
    compensation: { value: "$700‑$950", unit: "USD / month" },
    summary:
      "Daniel is a full-charge bookkeeper with three years supporting US small businesses remotely. He manages the full monthly cycle (AP/AR, bank and credit-card reconciliations, payroll runs and month-end close) primarily in QuickBooks Online and Xero, and keeps clean, review-ready books.",
    writingSample: {
      text: "One client's books had drifted six months out of reconciliation across four accounts. I worked backward from the last clean month, matched every uncleared transaction against the statements, and found a duplicated payroll import that had inflated expenses. After the cleanup their P&L finally matched what the owner saw in the bank, and we set up a weekly reconciliation cadence to keep it that way.",
      attribution: "Written during the AccountingTalent skills assessment · unedited",
    },
    capabilities: {
      title: "Core bookkeeping responsibilities",
      subtitle: "Day-to-day bookkeeping handled independently.",
      primary: ["AP / AR", "Bank reconciliations", "Monthly close"],
      extra: ["Payroll processing", "Financial reporting", "Sales-tax filings"],
    },
    software: [
      { name: "QuickBooks Online", meta: "Advanced · 3 yrs" },
      { name: "Xero", meta: "Intermediate · 2 yrs" },
      { name: "Bill.com" },
    ],
    verifications: [
      { label: "Identity verified", badge: { kind: "verified" }, detail: "Government-issued photo ID verified.", date: "Apr 2026" },
      { label: "English communication", badge: { kind: "level", level: "Advanced" }, detail: "Assessed for written and spoken business English.", date: "Mar 2026" },
      { label: "Qualification checked", badge: { kind: "verified" }, detail: "B.Com (Accountancy) confirmed with the issuing institution.", date: "Mar 2026" },
    ],
    history: [
      {
        title: "Full-Charge Bookkeeper",
        meta: "US bookkeeping firm · Remote (Manila, Philippines)",
        dates: "Mar 2023 to Present",
        bullets: [
          "Manages full monthly close for 12 US SMB clients in QuickBooks Online and Xero.",
          "Runs bi-weekly payroll and reconciles 30+ accounts monthly.",
        ],
        exposure: "US GAAP-basis monthly bookkeeping and reporting",
      },
    ],
    education: [
      { qualification: "B.Com (Accountancy)", meta: "University of Santo Tomas · 2021", status: "Completed", completed: true },
    ],
    preferences: [
      { label: "Employment", value: "Full-time" },
      { label: "Earliest start", value: "Immediately" },
      { label: "Preferred hours", value: "9:00 PM to 5:00 AM PHT" },
      { label: "US overlap", value: "6 hours ET overlap" },
      { label: "Full US shift", value: "Willing to work a full US shift" },
      { label: "Engagement", value: "Contractor" },
    ],
    decision: [
      { label: "Target role", value: "Bookkeeper" },
      { label: "Compensation", value: "$700‑$950 /mo" },
      { label: "Availability", value: "Available immediately" },
      { label: "US overlap", value: "6 hours ET overlap" },
      { label: "Preference", value: "Full-time" },
    ],
  },
];
