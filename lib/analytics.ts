import { track } from "@vercel/analytics";

/*
  Thin typed wrapper over Vercel Web Analytics custom events, so every call site
  goes through one place and the event names / prop shapes stay consistent. The
  smoke test reads these four events off the Vercel dashboard.

  `track` is browser-only and safe to call anywhere client-side: off Vercel (or
  in dev) it no-ops / logs, and it never throws. All call sites here are client
  components. Recording requires Web Analytics enabled on the Vercel project.
*/

/** Where a "Become a founding firm" CTA was clicked. `hero` is the nav CTA at
 *  the top of the page. */
export type CtaPosition = "hero" | "membership" | "pool" | "final" | "sticky";

export function trackCta(position: CtaPosition): void {
  track("cta_click", { position });
}

export function trackEmailSubmit(): void {
  track("email_submit");
}

export function trackRoleChip(role: string): void {
  track("chip_role_selected", { role });
}

export function trackTimingChip(timing: string): void {
  track("chip_timing_selected", { timing });
}
