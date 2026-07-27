/*
  The one server-side profile serializer. Given a fully-mapped candidate
  view-model and an effective visibility level, it returns a NEW view-model that
  contains only the fields that level may see — restricted fields are OMITTED
  (set to undefined / replaced with a generalised value), never masked. This is
  the object that gets serialized to the client, so anything absent here is absent
  from page source, hydration payload, structured data and error messages.

  It is pure (no I/O): the caller resolves privacy flags, the contact block and
  the CTA state and passes them in. This keeps all field-level permission logic in
  one testable place rather than scattered across components.
*/
import type {
  CandidateContact,
  CandidateProfile,
  ProfileCtaState,
} from "@/lib/profile/candidate";
import type { VisibilityLevel } from "./types";
import type { Entitlements } from "./plans";
import { canSeeIdentity, canSeeVerifiedEmployerFields } from "./visibility";

export type ProjectContext = {
  isPreview: boolean;
  /** The real viewer is an admin (drives the preview switcher; not the level). */
  isAdminViewer: boolean;
  privacy: { publicCompensation: boolean };
  /** Full contact, included ONLY at accepted-introduction / admin. */
  contact?: CandidateContact | null;
  cta: ProfileCtaState;
  /** Owner-previewing-as-employer mode (drives the candidate preview banner). */
  candidatePreview?: "public" | "employer" | "introduced";
  entitlements: Entitlements;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "Priya Sharma" -> "Priya S."; "Priya S." -> "Priya S."; "Priya" -> "Priya". */
function anonymizeName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  const last = parts[parts.length - 1].replace(/[^A-Za-z]/g, "");
  return `${parts[0]} ${(last[0] ?? "").toUpperCase()}.`;
}

/** "Ahmedabad, India" -> "India" (broad region only). */
function generalizeLocation(location: string): string {
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? location;
}

/** Drop the identifying institution, keep a year if present. */
function generalizeEducationMeta(meta?: string): string | undefined {
  if (!meta) return undefined;
  const year = meta.split("·").map((p) => p.trim()).find((p) => /^\d{4}$/.test(p));
  return year || undefined;
}

/**
 * Project a full view-model down to what `level` may see.
 * @param view  the fully-mapped candidate view-model (server-side only)
 */
export function projectProfileView(
  view: CandidateProfile,
  level: VisibilityLevel,
  ctx: ProjectContext,
): CandidateProfile {
  const identity = canSeeIdentity(level); // full name + contact
  const verifiedFields = canSeeVerifiedEmployerFields(level); // photo, exact city, named institutions
  const isAdmin = level === "admin";

  const out: CandidateProfile = { ...view };

  // Name: first + last initial unless identity is unlocked.
  out.name = identity ? view.name : anonymizeName(view.name);
  out.initials = initialsOf(out.name);

  // Photo: verified+ employers (and owner/accepted/admin via identity). Frosted
  // until identity is unlocked (owner / accepted introduction / admin): the photo
  // endpoint serves pre-blurred bytes to non-identity viewers, and `locked` tells
  // the UI to show the obscured/unlock treatment. A photo is NEVER public.
  const showPhoto = verifiedFields;
  if (!showPhoto) {
    out.photo = undefined;
  } else if (out.photo && !identity) {
    // Frosted for non-identity viewers — and SCRUB the alt text, which the mapper
    // builds from the full name ("Sai Swaminathan Ramji, …"). Without this the real
    // name ships in the serialized payload even though the visible alt is masked.
    out.photo = { ...out.photo, alt: "Candidate photo", locked: true };
  }

  // Location: broad region for non-verified; exact city for verified+.
  if (!verifiedFields && view.location) out.location = generalizeLocation(view.location);

  // Employer names: real names are NEVER surfaced (the mapper only ever puts the
  // candidate-supplied anonymised descriptor — employer_public — into `meta`). For
  // non-admins we keep that descriptor and append "· Name withheld" so the label is
  // useful ("Offshore US accounting firm · Name withheld") rather than a bare
  // "Employer name withheld". Titles, dates, bullets and exposure are preserved.
  if (!isAdmin) {
    out.history = view.history.map((h) => {
      const descriptor = (h.meta ?? "").trim();
      return { ...h, meta: descriptor ? `${descriptor} · Name withheld` : "Employer name withheld" };
    });
  }

  // Education institutions: generalised until verified+.
  if (!verifiedFields) {
    out.education = view.education.map((e) => ({ ...e, meta: generalizeEducationMeta(e.meta) }));
  }

  // Compensation: withheld (CTA shown instead) only when not verified AND the
  // candidate has not consented to public compensation. The value is dropped, not
  // hidden — it never reaches the client.
  const compensationLocked = !verifiedFields && !ctx.privacy.publicCompensation;
  if (compensationLocked) out.compensation = undefined;

  // Contact: only at accepted-introduction / admin.
  out.contact = identity ? ctx.contact ?? undefined : undefined;

  out.access = {
    level,
    isPreview: ctx.isPreview,
    adminControls: ctx.isAdminViewer,
    cta: ctx.cta,
    compensationLocked,
    candidatePreview: ctx.candidatePreview,
    paidFeatures: {
      assessmentBreakdown: ctx.entitlements.assessmentBreakdown,
      resumeDownload: ctx.entitlements.resumeDownload,
    },
  };

  return out;
}
