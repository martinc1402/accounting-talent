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
  compensationLine,
  overlapPhrase,
  roleCategory,
} from "@/lib/search/candidate";

// Availability is considered stale after this many days without reconfirmation.
const AVAILABILITY_STALE_DAYS = (() => {
  const n = Number(process.env.AVAILABILITY_STALE_DAYS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 45;
})();

/** Availability confirmation, keyed on the SAME timestamp the readiness panel and
 *  publication gate use (availability_structured_confirmed_at) so the public claim
 *  can never contradict the admin view. Three states:
 *    - 'confirmed'   : set and within AVAILABILITY_STALE_DAYS -> show "Confirmed <date>"
 *    - 'stale'       : set but older -> show "being reconfirmed" (it lapsed)
 *    - 'unconfirmed' : never confirmed -> show the stated availability plainly, no badge
 *  (A never-confirmed draft is NOT "being reconfirmed" — nothing was confirmed to lapse.) */
function availabilityFreshness(row: ProfileRow): {
  state: "confirmed" | "stale" | "unconfirmed";
  confirmed?: string;
} {
  const ts = (row.availability_structured_confirmed_at ?? "").trim();
  if (!ts) return { state: "unconfirmed" };
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return { state: "unconfirmed" };
  const ageDays = (Date.now() - d.getTime()) / 86_400_000;
  if (ageDays > AVAILABILITY_STALE_DAYS) return { state: "stale" };
  const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return { state: "confirmed", confirmed: `Confirmed ${label}` };
}

// Title + one-line subtitle for the role-specific capabilities card, keyed by
// the same role category the card uses for its evidence label.
const CAPABILITY_META: Record<RoleCategory, { title: string; subtitle: string }> = {
  tax: {
    title: "US returns prepared and reviewed",
    subtitle:
      "Federal and state returns this candidate has hands-on experience preparing or reviewing.",
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
import {
  resolveTargetRole,
  resolveExperienceLabel,
  resolveCompensation,
  resolveEtOverlap,
} from "@/lib/authz/readiness";

export type ProfileStat = { value: string; label: string; verified?: boolean };

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
  photo?: { src: string; alt: string; focal?: string; locked?: boolean };
  qualLine: string;
  // Roles the candidate is also open to (shown only when the role is confirmed).
  alternativeRoles?: string[];
  heroVerifications: string[];
  // Scannable proof points; each candidate-provided unless verified === true.
  evidence?: ProfileStat[];
  location?: string;
  overlap?: string;
  availability?: string;
  // "Confirmed 22 Jul 2026" when availability was recently reconfirmed; absent
  // when stale (the availability value itself switches to "being reconfirmed").
  availabilityConfirmed?: string;
  compensation?: { value: string; unit: string };
  // "Based on up to N hours/week" — shown only when the basis is confirmed.
  compensationBasis?: string;
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
  // Whether the viewing employer account has this candidate saved (set by the
  // page for the viewer's account; drives the Save toggle's initial state).
  saved?: boolean;
};

// jsonb column shapes (0008, extended 0015). Read whole with the row; loosely
// typed and coerced. New fields are optional so pre-0015 rows still map.
type EmploymentJson = {
  title?: string;
  role?: string;
  // employer_public is the only employer name shown publicly ("Offshore US
  // accounting firm"). employer_private is admin-only and NEVER read here.
  employer?: string;
  employer_public?: string;
  employer_private?: string;
  dates?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  bullets?: string[];
  responsibilities?: string[];
  exposure?: string;
  source_type?: string;
};
type EducationJson = {
  qualification?: string;
  degree?: string;
  field_of_study?: string;
  completion_status?: string;
  institution?: string;
  year?: string | number;
  status?: string;
  completed?: boolean;
  note?: string;
};
type SoftwareJson = {
  name?: string;
  level?: string;
  years?: number;
  last_used?: string;
  confirmed_by_candidate?: boolean;
};

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
  // 0014 fields.
  availability_confirmed_at?: string | null;
  timezone?: string | null; // IANA, e.g. "Asia/Kolkata"
  // 0015 readiness + structure.
  profile_status?: string | null;
  primary_target_role?: string | null;
  alternative_target_roles?: string[] | null;
  role_confirmed_at?: string | null;
  us_tax_experience_start_date?: string | null;
  us_tax_experience_months?: number | null;
  experience_confirmed_at?: string | null;
  compensation_currency?: string | null;
  compensation_period?: string | null;
  hours_per_week_basis?: number | null;
  compensation_basis_confirmed_at?: string | null;
  avail_days?: string[] | null;
  avail_start_time?: string | null;
  avail_finish_time?: string | null;
  avail_max_weekly_hours?: number | null;
  avail_busy_season_flexible?: boolean | null;
  availability_structured_confirmed_at?: string | null;
  software_confirmed_at?: string | null;
  education_confirmed_at?: string | null;
  candidate_publication_approved_at?: string | null;
  proof_points?: {
    value?: string;
    label?: string;
    source_type?: "candidate_provided" | "accounting_talent_verified";
    display_order?: number;
    is_public?: boolean;
  }[] | null;
  return_experience?: { form?: string; mode?: "prepared" | "reviewed" | "both" }[] | null;
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

/** Proof points from the structured proof_points column (public ones only),
 *  falling back to the legacy highlights column. Each carries its source so the
 *  UI never labels a candidate-provided point as independently verified. */
function evidence(row: ProfileRow): ProfileStat[] | undefined {
  const pp = (row.proof_points ?? [])
    .filter((p) => p?.value?.trim() && p?.label?.trim() && p.is_public !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((p) => ({
      value: (p.value as string).trim(),
      label: (p.label as string).trim(),
      verified: p.source_type === "accounting_talent_verified",
    }));
  if (pp.length) return pp;
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

/** Candidate-provided employment history. Only ever exposes the PUBLIC employer
 *  label (employer_public), never employer_private — the private name stays in
 *  the admin data. Entries are never labelled independently verified. */
function history(row: ProfileRow): ProfileHistoryEntry[] {
  const h = row.employment_history;
  if (!h?.length) return [];
  return h
    .map((j) => ({ ...j, title: (j.title ?? j.role ?? "").trim() }))
    .filter((j) => j.title)
    .map((j) => ({
      title: j.title,
      // employer_public first; legacy `employer` still works. NEVER employer_private.
      meta: (j.employer_public ?? j.employer ?? "").trim(),
      dates: (j.dates ?? "").trim(),
      bullets: j.responsibilities?.length ? j.responsibilities : j.bullets ?? [],
      exposure: j.exposure?.trim() || undefined,
    }));
}

function education(row: ProfileRow): ProfileEducationEntry[] {
  const e = row.education;
  if (e?.length) {
    return e
      .map((x) => ({ ...x, qualification: (x.qualification ?? x.degree ?? "").trim() }))
      .filter((x) => x.qualification)
      .map((x) => {
        // Anonymous/unverified viewers get "Completed · Commerce" (status + field);
        // the projection layer adds institution + year only for verified employers.
        const generic = [x.completion_status, x.field_of_study].filter(Boolean).join(" · ");
        const detailed = [x.institution, x.year].filter(Boolean).join(" · ");
        return {
          qualification: x.qualification,
          meta: detailed || generic || undefined,
          status: (x.status ?? x.completion_status)?.trim() || undefined,
          completed: x.completed,
          note: x.note?.trim() || undefined,
        };
      });
  }
  // Fallback: the single free-text qualification the form does capture.
  const q = (row.qualification ?? "").trim();
  return q ? [{ qualification: q }] : [];
}

function preferences(row: ProfileRow): ProfileFact[] {
  const overlap = overlapPhrase(row);
  // The raw working-hours note is unstructured free-text; like the search card
  // (lib/search/candidate.ts), we don't surface it publicly as fact until the
  // structured availability is candidate-confirmed. Unconfirmed -> admin-only.
  const workingHours = row.availability_structured_confirmed_at
    ? (row.working_hours ?? "").trim()
    : "";
  const entries: [string, string][] = [
    ["Employment", (row.employment_type ?? "").trim()],
    ["Earliest start", (row.start_date ?? "").trim()],
    ["Preferred hours", workingHours],
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
  const compResolved = resolveCompensation(row);
  // ET overlap: structured et_overlap_hours, else computed from confirmed avail
  // times, else nothing (never echo free-text).
  const overlap = overlapPhrase(row) ?? resolveEtOverlap(row).value;
  const rawAvailability = (row.availability ?? "").trim() || undefined;
  const employmentType = (row.employment_type ?? "").trim();
  const location = [row.city, row.country ?? row.state].filter(Boolean).join(", ") || undefined;

  // Confirmed primary role wins; else the raw applicant role.
  const targetRole = resolveTargetRole(row).value ?? row.role;
  const alternativeRoles =
    !!row.role_confirmed_at && (row.alternative_target_roles?.length ?? 0) > 0
      ? row.alternative_target_roles ?? undefined
      : undefined;

  // Availability freshness: a lapsed confirmation is not presented as current; a
  // never-confirmed availability just shows the stated value (no badge).
  const fresh = availabilityFreshness(row);
  const availability = fresh.state === "stale" ? "Availability being reconfirmed" : rawAvailability;

  const decision: ProfileFact[] = [{ label: "Target role", value: targetRole }];
  if (comp) decision.push({ label: "Compensation", value: compResolved.line ?? comp.value });
  if (availability) decision.push({ label: "Availability", value: availability });
  if (overlap) decision.push({ label: "US overlap", value: overlap });
  if (employmentType) decision.push({ label: "Preference", value: employmentType });

  // Experience label: exact only from confirmed data, else a grammatical range.
  const qualLine = [row.qualification?.trim(), resolveExperienceLabel(row).value].filter(Boolean).join(" · ");
  const ws = (assessment?.writingSample ?? "").trim();

  // "Verified candidate" only when AccountingTalent has actually completed a
  // check; otherwise it's a published-but-unverified profile.
  const verifs = verifications(row, assessment);

  return {
    id: row.id,
    eyebrow: verifs.length ? "Verified candidate" : "Candidate profile",
    name: row.full_name,
    initials: initialsOf(row.full_name),
    role: targetRole,
    photo: row.photo_url
      ? {
          src: row.photo_url,
          alt: `${row.full_name}, ${targetRole}`,
          focal: (row.photo_focal ?? "").trim() || undefined,
        }
      : undefined,
    qualLine,
    alternativeRoles,
    heroVerifications: heroVerifications(row, assessment),
    evidence: evidence(row),
    location,
    overlap,
    availability,
    availabilityConfirmed: fresh.state === "confirmed" ? fresh.confirmed : undefined,
    compensation: comp,
    compensationBasis: compResolved.basis,
    summary: (row.professional_summary ?? "").trim() || undefined,
    writingSample: ws
      ? { text: ws, attribution: "Written during the AccountingTalent skills assessment · unedited" }
      : undefined,
    capabilities: capabilities(row),
    software: software(row),
    verifications: verifs,
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
    alternativeRoles: ["US Tax Reviewer"],
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
      { value: "4", label: "tax seasons", verified: true },
    ],
    location: "Ahmedabad, India",
    overlap: "4+ hours ET overlap",
    availability: "Available within 30 days",
    availabilityConfirmed: "Confirmed 22 Jul 2026",
    compensation: { value: "$900–$1,200", unit: "USD / month" },
    compensationBasis: "Based on up to 40 hours/week",
    summary:
      "Priya is a US tax preparer with four busy seasons preparing federal and multi-state returns for an outsourced US CPA firm. She owns a book of 40+ small-business and individual clients end to end in Drake and Lacerte, from workpaper prep through review-ready filing, and is strongest on 1040, 1120-S and 1065 engagements.",
    writingSample: {
      text: "A client came to us mid-season with two years of unfiled 1120-S returns and no clean workpapers. I rebuilt the trial balances from the bank feeds in QuickBooks, reconciled the shareholder basis, and got both years filed before the extended deadline. The owner had assumed the penalties were unavoidable; we abated most of them with a reasonable-cause letter.\n\nThe harder part was the shareholder basis schedule. The prior preparer had never tracked it, so distributions in year two looked like they exceeded basis. I reconstructed contributions and loans from the formation documents and the bank history, which brought the basis back into line and avoided a gain that would otherwise have been reported in error.\n\nWhat I took from it: the return is only as good as the workpapers underneath it. I now start every clean-up engagement by rebuilding the books before I touch the tax forms, and I document each assumption so the review is fast and the client can follow the reasoning.",
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
        status: "Completed",
        completed: true,
        note: "Both groups cleared; currently pursuing CA Final.",
      },
      { qualification: "B.Com (Accounting & Finance)", meta: "Gujarat University · 2020", status: "Completed", completed: true },
      { qualification: "QuickBooks Online ProAdvisor", meta: "Intuit · 2023", status: "Certified", completed: true },
    ],
    preferences: [
      { label: "Employment", value: "Full-time" },
      { label: "Earliest start", value: "Within 30 days" },
      { label: "Preferred hours", value: "3:30 PM–11:30 PM IST" },
      { label: "US overlap", value: "4+ hours ET overlap" },
      { label: "Full US shift", value: "Willing to work a full US shift" },
      { label: "Engagement", value: "Employer of record / contractor" },
    ],
    decision: [
      { label: "Target role", value: "US Tax Preparer" },
      { label: "Compensation", value: "$900–$1,200/month" },
      { label: "Availability", value: "Available within 30 days" },
      { label: "US overlap", value: "4+ hours ET overlap" },
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
    overlap: "6+ hours ET overlap",
    availability: "Available immediately",
    availabilityConfirmed: "Confirmed 20 Jul 2026",
    compensation: { value: "$700–$950", unit: "USD / month" },
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
      { label: "Preferred hours", value: "9:00 PM–5:00 AM PHT" },
      { label: "US overlap", value: "6+ hours ET overlap" },
      { label: "Full US shift", value: "Willing to work a full US shift" },
      { label: "Engagement", value: "Contractor" },
    ],
    decision: [
      { label: "Target role", value: "Bookkeeper" },
      { label: "Compensation", value: "$700–$950/month" },
      { label: "Availability", value: "Available immediately" },
      { label: "US overlap", value: "6+ hours ET overlap" },
      { label: "Preference", value: "Full-time" },
    ],
  },
];
