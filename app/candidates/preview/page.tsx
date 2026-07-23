import type { Metadata } from "next";
import { CandidateProfile } from "@/components/profile/CandidateProfile";
import { sampleProfiles, type ProfileCtaState } from "@/lib/profile/candidate";
import { projectProfileView } from "@/lib/authz/projectCandidate";
import { PLAN_ENTITLEMENTS } from "@/lib/authz/plans";
import type { VisibilityLevel } from "@/lib/authz/types";

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
  searchParams: Promise<{ c?: string; level?: string; comp?: string }>;
}) {
  const { c, level, comp } = await searchParams;
  const sample = sampleProfiles.find((p) => p.id === `sample-${c}`) ?? sampleProfiles[0];

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
    return <CandidateProfile profile={projected} />;
  }

  return <CandidateProfile profile={sample} />;
}
