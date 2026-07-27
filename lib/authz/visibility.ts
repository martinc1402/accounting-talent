/*
  The single place that derives an effective visibility level for a profile
  request. Every profile response and every gated field flows from this. Pure and
  synchronous so it is trivially unit-testable and cannot silently reach for I/O.

  Default-deny: the lowest level (anonymous) is the floor, and any caller that is
  not clearly entitled to more gets it.
*/
import type { Introduction, VisibilityLevel, Viewer } from "./types";

/** True when this authenticated viewer owns this specific application (candidate
 *  self-view). Ownership is per-application (applications.user_id), so it is
 *  resolved by the route, not deriveVisibility. */
export function isApplicationOwner(
  viewer: Viewer,
  app: { user_id?: string | null } | null | undefined,
): boolean {
  return viewer.kind === "user" && !!app?.user_id && app.user_id === viewer.userId;
}

export type DerivedVisibility = {
  level: VisibilityLevel;
  /** True when an admin is previewing a lower level; mutations must be blocked. */
  isPreview: boolean;
};

/**
 * @param viewer        resolved caller (getViewer)
 * @param introduction  the VIEWER'S OWN introduction for this candidate, if any
 *                       (must be fetched scoped to the viewer's account, so it
 *                       can never belong to another employer)
 * @param opts.previewAs admin-only: render as this level (presentation only)
 */
export function deriveVisibility(
  viewer: Viewer,
  introduction: Introduction | null | undefined,
  opts?: { previewAs?: VisibilityLevel | null },
): DerivedVisibility {
  // Admin preview: only an admin may preview, and it only changes presentation.
  if (viewer.kind === "user" && viewer.isAdmin && opts?.previewAs) {
    return { level: opts.previewAs, isPreview: true };
  }
  if (viewer.kind === "user" && viewer.isAdmin) {
    return { level: "admin", isPreview: false };
  }

  // Accepted introduction — ONLY for the employer account tied to that intro.
  if (
    viewer.kind === "user" &&
    viewer.account &&
    introduction &&
    introduction.status === "accepted" &&
    introduction.employerAccountId != null &&
    introduction.employerAccountId === viewer.account.id
  ) {
    return { level: "accepted_introduction", isPreview: false };
  }

  // Verified employer → free or paid by plan (plan never implies verification).
  if (viewer.kind === "user" && viewer.account?.verificationState === "verified") {
    return {
      level: viewer.account.plan === "paid" ? "paid_verified_employer" : "free_verified_employer",
      isPreview: false,
    };
  }

  // Signed in but no verified account → same visibility as anonymous.
  if (viewer.kind === "user") {
    return { level: "unverified_employer", isPreview: false };
  }

  return { level: "anonymous", isPreview: false };
}

/** Rank for comparisons like "level >= free_verified_employer". */
const RANK: Record<VisibilityLevel, number> = {
  anonymous: 0,
  unverified_employer: 0, // deliberately identical access to anonymous
  free_verified_employer: 1,
  paid_verified_employer: 2,
  accepted_introduction: 3,
  owner: 3, // sees own identity + fields (like accepted); admin controls excluded
  admin: 4,
};

export function atLeast(level: VisibilityLevel, floor: VisibilityLevel): boolean {
  return RANK[level] >= RANK[floor];
}

/** Photo, exact city, named institutions, full chronology unlock here. */
export function canSeeVerifiedEmployerFields(level: VisibilityLevel): boolean {
  return atLeast(level, "free_verified_employer");
}

/** Full name / contact only at accepted-introduction, the owner (self), or admin. */
export function canSeeIdentity(level: VisibilityLevel): boolean {
  return level === "accepted_introduction" || level === "owner" || level === "admin";
}

/** Who may receive ANY photo bytes: owner / admin / accepted (clear) get it, and
 *  verified employers get the FROSTED derivative. Everyone else gets nothing.
 *  public_photo is intentionally NOT a factor — a photo can never be made public. */
export function canViewPhoto(level: VisibilityLevel): boolean {
  return canSeeVerifiedEmployerFields(level);
}

/** A profile may be search-indexed only when the candidate opted in AND it is
 *  published (verified) AND currently available. */
export function canIndexProfile(args: {
  allowSearchIndexing: boolean;
  hasVerifiedAt: boolean;
  hasAvailability: boolean;
}): boolean {
  return args.allowSearchIndexing && args.hasVerifiedAt && args.hasAvailability;
}
