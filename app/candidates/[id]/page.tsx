import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loadCandidate, resolveProfileAccess } from "./access";
import {
  applicationToProfile,
  type CandidateContact,
  type ProfileCtaState,
  type ProfileRow,
} from "@/lib/profile/candidate";
import { CandidateProfile } from "@/components/profile/CandidateProfile";
import { getViewer } from "@/lib/authz/viewer";
import { canIndexProfile, deriveVisibility, isApplicationOwner } from "@/lib/authz/visibility";
import {
  isPublished,
  readinessChecklist,
  publicationRequirements,
  type ReadinessRow,
} from "@/lib/authz/readiness";
import { entitlementsFor } from "@/lib/authz/plans";
import { ACTIVE_INTRO_STATUSES, canCreateIntroduction } from "@/lib/authz/introductions";
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

// loadCandidate + the authorization gate live in ./access.ts so layout.tsx,
// generateMetadata and this page all resolve them identically (and share the
// queries via React.cache).

const PREVIEW_LEVELS: VisibilityLevel[] = [
  "anonymous",
  "unverified_employer",
  "free_verified_employer",
  "paid_verified_employer",
  "accepted_introduction",
];

// Owner "Preview as employer" modes → the level each renders at, and the real
// employer CTA to show (disabled) for fidelity.
type PreviewMode = "public" | "employer" | "introduced";
const VIEW_AS: Record<PreviewMode, VisibilityLevel> = {
  public: "anonymous",
  employer: "free_verified_employer",
  introduced: "accepted_introduction",
};
const PREVIEW_CTA: Record<PreviewMode, ProfileCtaState> = {
  public: { kind: "register" },
  employer: { kind: "request" },
  introduced: { kind: "accepted" },
};

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
  // Gated exactly like the page: a viewer who may not see the profile must not
  // learn its role or even that the id resolves. Previously this titled the tab
  // "Sai R. · Tax Reviewer" for anyone holding the UUID, including viewers the
  // page then refused. Same generic metadata for missing and forbidden.
  const { data, allowed } = await resolveProfileAccess(id);
  if (!data || !allowed) {
    return { title: "Candidate profile", robots: { index: false, follow: false } };
  }

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
  if (level === "owner") return { kind: "self" };
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
  searchParams: Promise<{ preview?: string; bare?: string; viewAs?: string }>;
}) {
  const { id } = await params;
  const { preview, bare, viewAs } = await searchParams;

  // Resolved once per request and shared with layout.tsx + generateMetadata via
  // React.cache. layout.tsx has already turned `!allowed` into a 404 — this
  // repeat is the second lock on the same door, and costs a cached boolean.
  const { data, viewer, isAdmin, isOwner, introduction, hasActiveIntro, allowed } =
    await resolveProfileAccess(id);
  if (!data || !allowed) notFound();

  const app = data.app as Record<string, unknown>;
  // The viewer's employer account, if any — scopes the saved/limit lookups below.
  const accountId = viewer.kind === "user" ? viewer.account?.id ?? null : null;

  // Admin-only presentation preview.
  const previewAs =
    viewer.kind === "user" && viewer.isAdmin && preview && PREVIEW_LEVELS.includes(preview as VisibilityLevel)
      ? (preview as VisibilityLevel)
      : null;

  // "Bare" admin preview: render EXACTLY as the previewed viewer would see it —
  // real CTA, contact card, no readiness panel / preview switcher / banner. Lets an
  // admin sanity-check the true experience (e.g. an accepted-introduction employer)
  // without the admin chrome. Admin-only, and only meaningful alongside ?preview=.
  const bareView = previewAs !== null && bare === "1";

  // Owner "Preview as employer": the owner viewing their OWN profile as an employer
  // (or the public) sees it. Owner-only; renders at a LOWER-disclosure level (the
  // projection projects down, so it's safe — it's the owner's own data).
  const candidatePreview: PreviewMode | null =
    isOwner && viewAs && viewAs in VIEW_AS ? (viewAs as PreviewMode) : null;

  const derived = deriveVisibility(viewer, introduction, { previewAs });
  // Owner-preview renders at the previewed level; otherwise owner self-view overrides
  // the derived level (except when an admin previews or is themselves the derived admin).
  const level: VisibilityLevel = candidatePreview
    ? VIEW_AS[candidatePreview]
    : isOwner && !previewAs && derived.level !== "admin"
      ? "owner"
      : derived.level;
  // In bare mode the admin views AS the level, so the preview chrome/flags are off.
  const isPreview = derived.isPreview && !bareView;
  const isAdminViewer = isAdmin && !bareView;

  const entitlements = entitlementsFor(viewer.kind === "user" ? viewer.account : null);
  const activeCount = accountId ? await countActiveIntroductions(accountId) : 0;
  const canRequest =
    !isPreview && canCreateIntroduction({ level, activeCount, entitlements }).ok;

  // In owner-preview show the REAL employer CTA for the level (rendered disabled for
  // fidelity); otherwise derive normally.
  const cta = candidatePreview
    ? PREVIEW_CTA[candidatePreview]
    : deriveCta({ level, isPreview, introduction, canRequest });

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
    isAdminViewer,
    privacy: {
      publicCompensation: app.public_compensation !== false,
    },
    contact:
      level === "accepted_introduction" || level === "admin" ? buildContact(app) : null,
    cta,
    candidatePreview: candidatePreview ?? undefined,
    entitlements,
  });

  // Never emit the raw storage URL: serve the photo through the authorizing
  // endpoint, which re-checks entitlement on every fetch.
  if (projected.photo) {
    projected.photo = { ...projected.photo, src: `/api/candidates/${id}/photo` };
  }

  // Saved state, scoped to the viewer's employer account (verified only). Never in
  // owner-preview (the owner has no employer account; the button is inert anyway).
  projected.saved =
    !candidatePreview && !isPreview && level !== "anonymous" && level !== "unverified_employer"
      ? await isCandidateSaved(accountId, id)
      : false;

  // In owner-preview, render the header EXACTLY as the previewed viewer sees it
  // (public → logged-out header; employer/introduced → employer header), fully inert.
  const nav = candidatePreview
    ? candidatePreview === "public"
      ? { authenticated: false, preview: true }
      : { authenticated: true, role: "employer" as const, preview: true }
    : navFromViewer(viewer);

  // Admin readiness (draft banner + checklist + publication requirements). Only
  // ever sent to admins; suppressed in bare mode so the view is chrome-free.
  const admin = isAdmin && !bareView
    ? {
        status: String((app as ReadinessRow).profile_status ?? "draft"),
        checklist: readinessChecklist(app as ReadinessRow),
        publication: publicationRequirements(app as ReadinessRow),
      }
    : undefined;

  return <CandidateProfile profile={projected} nav={nav} admin={admin} />;
}
