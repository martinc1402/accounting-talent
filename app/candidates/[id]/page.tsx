import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  applicationToProfile,
  type CandidateContact,
  type ProfileCtaState,
  type ProfileRow,
} from "@/lib/profile/candidate";
import { CandidateProfile } from "@/components/profile/CandidateProfile";
import { getViewer } from "@/lib/authz/viewer";
import { canIndexProfile, deriveVisibility } from "@/lib/authz/visibility";
import {
  isPublished,
  readinessChecklist,
  publicationRequirements,
  type ReadinessRow,
} from "@/lib/authz/readiness";
import { entitlementsFor } from "@/lib/authz/plans";
import { canCreateIntroduction } from "@/lib/authz/introductions";
import {
  countActiveIntroductions,
  getViewerIntroduction,
} from "@/lib/authz/introductionsRepo";
import { projectProfileView } from "@/lib/authz/projectCandidate";
import { isCandidateSaved } from "@/lib/authz/savedRepo";
import { navFromViewer } from "@/components/ui/SiteHeader";
import type { Introduction, VisibilityLevel } from "@/lib/authz/types";

/*
  The candidate profile a firm opens from a search card. AUTHORIZED per viewer:
  the full row is loaded server-side, then projected to only the fields the
  viewer's effective visibility level may see BEFORE anything is serialized to the
  browser (projectProfileView). Restricted fields are omitted, never masked.

  Per-viewer, so it must never be publicly cached — force-dynamic. Gated to
  VERIFIED candidates (verified_at) exactly like before; noindex unless the
  candidate has opted into indexing AND is published/available.
*/
export const dynamic = "force-dynamic";

const loadCandidate = cache(async (id: string) => {
  if (!supabaseConfigured || !supabase) return null;

  const { data: app, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // No publication gate here — the page decides (published for the public,
  // any state for admins previewing a draft).
  if (error || !app) return null;

  const { data: assessment } = await supabase
    .from("assessments")
    .select("writing_sample, quiz_score")
    .eq("application_id", id)
    .in("status", ["submitted", "passed", "failed"])
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { app, assessment };
});

const PREVIEW_LEVELS: VisibilityLevel[] = [
  "anonymous",
  "unverified_employer",
  "free_verified_employer",
  "paid_verified_employer",
  "accepted_introduction",
];

function anonymizeName(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "Candidate";
  const last = parts[parts.length - 1].replace(/[^A-Za-z]/g, "");
  return `${parts[0]} ${(last[0] ?? "").toUpperCase()}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadCandidate(id);
  if (!data) return { title: "Candidate profile", robots: { index: false, follow: false } };

  const app = data.app as ProfileRow & {
    verified_at?: string | null;
    allow_search_indexing?: boolean | null;
    availability?: string | null;
  };
  // Metadata must carry no PII: anonymise the name in the title.
  const title = `${anonymizeName(app.full_name)} · ${app.role}`;

  // Only published, opted-in, available profiles are indexable.
  const indexable =
    isPublished(app) &&
    canIndexProfile({
      allowSearchIndexing: app.allow_search_indexing === true,
      hasVerifiedAt: !!app.verified_at,
      hasAvailability: !!(app.availability ?? "").trim(),
    });

  return { title, robots: { index: indexable, follow: indexable } };
}

function buildContact(app: Record<string, unknown>): CandidateContact {
  return {
    fullName: String(app.full_name ?? ""),
    email: (app.email as string) || undefined,
    phone: (app.whatsapp as string) || undefined,
    linkedin: (app.linkedin as string) || undefined,
  };
}

function deriveCta(args: {
  level: VisibilityLevel;
  isPreview: boolean;
  introduction: Introduction | null;
  canRequest: boolean;
}): ProfileCtaState {
  const { level, isPreview, introduction, canRequest } = args;
  if (isPreview) return { kind: "preview" };
  if (level === "accepted_introduction" || level === "admin") return { kind: "accepted" };

  // An in-flight request shows its status regardless of level.
  if (
    introduction &&
    introduction.status !== "cancelled" &&
    introduction.status !== "declined" &&
    introduction.status !== "expired"
  ) {
    return { kind: "status", status: introduction.status };
  }

  if (level === "anonymous") return { kind: "register" };
  if (level === "unverified_employer") return { kind: "verify" };
  return canRequest ? { kind: "request" } : { kind: "at_limit" };
}

export default async function CandidateProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const { preview } = await searchParams;
  const data = await loadCandidate(id);
  if (!data) notFound();

  const app = data.app as Record<string, unknown>;
  const viewer = await getViewer();
  const isAdmin = viewer.kind === "user" && viewer.isAdmin;

  // Publication gate: only published profiles are public. Admins preview any state.
  if (!isPublished(app as ReadinessRow) && !isAdmin) notFound();

  // Admin-only presentation preview.
  const previewAs =
    viewer.kind === "user" && viewer.isAdmin && preview && PREVIEW_LEVELS.includes(preview as VisibilityLevel)
      ? (preview as VisibilityLevel)
      : null;

  // The viewer's OWN introduction for this candidate (scoped to their account).
  const accountId = viewer.kind === "user" ? viewer.account?.id ?? null : null;
  const introduction = await getViewerIntroduction(id, accountId);

  const { level, isPreview } = deriveVisibility(viewer, introduction, { previewAs });

  const entitlements = entitlementsFor(viewer.kind === "user" ? viewer.account : null);
  const activeCount = accountId ? await countActiveIntroductions(accountId) : 0;
  const canRequest =
    !isPreview && canCreateIntroduction({ level, activeCount, entitlements }).ok;

  const cta = deriveCta({ level, isPreview, introduction, canRequest });

  // Build the FULL view-model server-side, then project down to the level.
  const assessment = data.assessment?.writing_sample
    ? {
        name: "Skills assessment",
        score: data.assessment.quiz_score ?? null,
        writingSample: data.assessment.writing_sample as string,
      }
    : null;

  const fullView = applicationToProfile(app as ProfileRow, assessment);

  const projected = projectProfileView(fullView, level, {
    isPreview,
    isAdminViewer: viewer.kind === "user" && viewer.isAdmin,
    privacy: {
      publicPhoto: app.public_photo === true,
      publicCompensation: app.public_compensation !== false,
    },
    contact:
      level === "accepted_introduction" || level === "admin" ? buildContact(app) : null,
    cta,
    entitlements,
  });

  // Never emit the raw storage URL: serve the photo through the authorizing
  // endpoint, which re-checks entitlement on every fetch.
  if (projected.photo) {
    projected.photo = { ...projected.photo, src: `/api/candidates/${id}/photo` };
  }

  // Saved state, scoped to the viewer's employer account (verified only).
  projected.saved =
    !isPreview && level !== "anonymous" && level !== "unverified_employer"
      ? await isCandidateSaved(accountId, id)
      : false;

  const nav = navFromViewer(viewer);

  // Admin readiness (draft banner + checklist + publication requirements). Only
  // ever sent to admins; never part of a public/employer response.
  const admin = isAdmin
    ? {
        status: String((app as ReadinessRow).profile_status ?? "draft"),
        checklist: readinessChecklist(app as ReadinessRow),
        publication: publicationRequirements(app as ReadinessRow),
      }
    : undefined;

  return <CandidateProfile profile={projected} nav={nav} admin={admin} />;
}
