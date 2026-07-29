import "server-only";
import { cache } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { getViewer } from "@/lib/authz/viewer";
import { isApplicationOwner } from "@/lib/authz/visibility";
import { isPublished, type ReadinessRow } from "@/lib/authz/readiness";
import { ACTIVE_INTRO_STATUSES } from "@/lib/authz/introductions";
import { getViewerIntroduction } from "@/lib/authz/introductionsRepo";
import type { Introduction, Viewer } from "@/lib/authz/types";

/*
  Who may open this profile, resolved once per request.

  This lives outside page.tsx because two things need the same answer and must
  not disagree: generateMetadata (which must not title, or even acknowledge, a
  page the viewer cannot see) and the page itself. They used to gate
  independently, and generateMetadata didn't, which leaked an anonymised name and
  role to anyone holding the id.

  Both exports are React.cache'd, so the pair shares one set of queries.
*/

export const loadCandidate = cache(async (id: string) => {
  if (!supabaseConfigured || !supabase) return null;

  const { data: app, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // No publication gate here — resolveProfileAccess decides.
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

const loadIntroduction = cache(
  async (id: string, accountId: string | null): Promise<Introduction | null> =>
    getViewerIntroduction(id, accountId),
);

export type ProfileAccess = {
  data: Awaited<ReturnType<typeof loadCandidate>>;
  viewer: Viewer;
  isAdmin: boolean;
  isOwner: boolean;
  introduction: Introduction | null;
  hasActiveIntro: boolean;
  /** False means the caller must render nothing about this profile. */
  allowed: boolean;
};

export const resolveProfileAccess = cache(async (id: string): Promise<ProfileAccess> => {
  const data = await loadCandidate(id);
  const viewer = await getViewer();
  const isAdmin = viewer.kind === "user" && viewer.isAdmin;
  const app = (data?.app ?? {}) as Record<string, unknown>;
  // Owner = the candidate viewing their own application (per-application ownership).
  const isOwner = !!data && isApplicationOwner(viewer, app as { user_id?: string | null });

  // The viewer's OWN introduction for this candidate (scoped to their account).
  const accountId = viewer.kind === "user" ? viewer.account?.id ?? null : null;
  const introduction = data ? await loadIntroduction(id, accountId) : null;
  // An employer with an in-progress introduction keeps access even if the candidate
  // pauses/unpublishes — introductions already underway continue (graceful pause).
  const hasActiveIntro =
    !!introduction && (ACTIVE_INTRO_STATUSES as readonly string[]).includes(introduction.status);

  // Publication gate: only published profiles are public. Admins preview any state;
  // the owner may always view their own profile (even as a draft); an employer with
  // an active introduction keeps access through a pause.
  const allowed =
    !!data && (isPublished(app as ReadinessRow) || isAdmin || isOwner || hasActiveIntro);

  return { data, viewer, isAdmin, isOwner, introduction, hasActiveIntro, allowed };
});
