import type { ProfileCtaState } from "@/lib/profile/candidate";

/** Shared tooltip on every inert employer control shown in owner-preview. */
export const PREVIEW_TITLE = "Shown for preview only";

/**
 * The single source of truth for whether the profile's PRIMARY employer action
 * attaches a live (mutating) click handler. It is live ONLY for the "request" CTA
 * and ONLY when not previewing — every other state renders as a link or an inert
 * span. Pure + dependency-free so the "no employer handler can fire in preview"
 * guarantee is unit-testable without a DOM.
 */
export function primaryIsLive(cta: ProfileCtaState, previewDisabled: boolean): boolean {
  return !previewDisabled && cta.kind === "request";
}
