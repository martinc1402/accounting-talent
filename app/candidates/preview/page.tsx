import type { Metadata } from "next";
import { CandidateProfile, type AdminReadiness } from "@/components/profile/CandidateProfile";
import { sampleProfiles, type ProfileCtaState } from "@/lib/profile/candidate";
import { projectProfileView } from "@/lib/authz/projectCandidate";
import { PLAN_ENTITLEMENTS } from "@/lib/authz/plans";
import {
  readinessChecklist,
  publicationRequirements,
  type ReadinessRow,
} from "@/lib/authz/readiness";
import type { VisibilityLevel } from "@/lib/authz/types";

/*
  A Sai-like draft row (unconfirmed proposals, no employment, no AT checks) used
  ONLY to demonstrate the real admin readiness panel here without a DB. The
  checklist + publication status below are produced by the SAME functions the live
  route uses, so this preview is faithful, not a mock of the UI.
*/
const DEMO_DRAFT_ROW: ReadinessRow = {
  profile_status: "draft",
  role: "Tax Reviewer / Senior Tax",
  primary_target_role: "Senior US Tax Reviewer",
  alternative_target_roles: ["Senior US Tax Associate"],
  experience_years: "3 to 5 years",
  experience_focus: "US tax",
  salary_min_usd: 1800,
  salary_max_usd: 2500,
  hours_per_week_basis: 20,
  avail_max_weekly_hours: 20,
  availability: "Part-time (up to 20 hrs/week)",
  timezone: "Asia/Kolkata",
  software_proficiency: [{ name: "CCH Axcess Tax" }, { name: "GoSystem Tax RS" }],
  return_experience: [{ form: "Form 1120" }],
  tax_forms: ["Form 1120"],
  professional_summary: "Senior tax reviewer with US entity-return experience…",
  qualification: "B.Com",
  employment_history: [],
};

function demoAdmin(): AdminReadiness {
  return {
    status: "draft",
    checklist: readinessChecklist(DEMO_DRAFT_ROW),
    publication: publicationRequirements(DEMO_DRAFT_ROW),
  };
}

/*
  Local preview of the candidate profile page with sample data. Also exercises the
  REAL server-side projection: ?level=<visibility level> renders the sample as that
  level would see it (so the field-level authorization can be demonstrated without
  a live session/DB). noindex, like the rest of /candidates.

  ?c=daniel switches sample (defaults to Priya). ?level=anonymous|unverified_employer
  |free_verified_employer|paid_verified_employer|accepted_introduction|admin.
*/
export const metadata: Metadata = {
  title: "Candidate profile preview",
  robots: { index: false, follow: false },
};

const LEVELS: VisibilityLevel[] = [
  "anonymous",
  "unverified_employer",
  "free_verified_employer",
  "paid_verified_employer",
  "accepted_introduction",
  "admin",
];

// Illustrative contact for the accepted/admin preview (clearly fictional).
const SAMPLE_CONTACT = {
  fullName: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98250 12345",
  linkedin: "https://www.linkedin.com/in/priya-sharma-ca",
};

function ctaForLevel(level: VisibilityLevel): ProfileCtaState {
  switch (level) {
    case "anonymous":
      return { kind: "register" };
    case "unverified_employer":
      return { kind: "verify" };
    case "accepted_introduction":
    case "admin":
      return { kind: "accepted" };
    default:
      return { kind: "request" };
  }
}

export default async function CandidatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; level?: string; comp?: string; admin?: string }>;
}) {
  const { c, level, comp, admin } = await searchParams;
  const sample = sampleProfiles.find((p) => p.id === `sample-${c}`) ?? sampleProfiles[0];

  // ?admin=1 renders the real admin readiness panel over the profile (demo only).
  const adminReadiness = admin === "1" ? demoAdmin() : undefined;

  if (level && LEVELS.includes(level as VisibilityLevel)) {
    const lvl = level as VisibilityLevel;
    const paid = lvl === "paid_verified_employer" || lvl === "admin";
    const projected = projectProfileView(sample, lvl, {
      isPreview: false,
      isAdminViewer: lvl === "admin",
      privacy: { publicPhoto: false, publicCompensation: comp !== "0" },
      contact: lvl === "accepted_introduction" || lvl === "admin" ? SAMPLE_CONTACT : null,
      cta: ctaForLevel(lvl),
      entitlements: paid ? PLAN_ENTITLEMENTS.paid : PLAN_ENTITLEMENTS.free,
    });
    return <CandidateProfile profile={projected} admin={adminReadiness} />;
  }

  return <CandidateProfile profile={sample} admin={adminReadiness} />;
}
