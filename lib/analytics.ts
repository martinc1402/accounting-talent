import { track } from "@vercel/analytics";

/*
  Thin typed wrapper over Vercel Web Analytics custom events, so every call site
  goes through one place and the event names / prop shapes stay consistent.

  `track` is browser-only and safe to call anywhere client-side: off Vercel (or
  in dev) it no-ops / logs, and it never throws. All call sites here are client
  components. Recording requires Web Analytics enabled on the Vercel project.

  NO PII, EVER. Every prop below is a closed union or a kebab-case id authored in
  a content file. Never pass a firm name, a work email, a candidate name, or the
  free-text `details` field. lib/meta-pixel.ts states the same rule for the same
  reason: these payloads leave our systems.
*/

/*
  Where an accountant-profile CTA sat. Only the hidden /accountants page uses
  these now (its code is kept, the route is redirected).
*/
export type Surface =
  | "hero"
  | "nav"
  | "pricing"
  | "passport"
  | "network"
  | "final";

/** A firm opened a real example profile. Fires on the click through to
 *  /candidates/preview, so it measures intent rather than scroll depth. */
export function trackExampleProfile(surface: Surface): void {
  track("example_profile_viewed", { surface });
}

/** An accountant clicked through to the application. */
export function trackAccountantJoin(surface: Surface): void {
  track("accountant_join_clicked", { surface });
}

/* -------------------------------------------------------------------------- */
/* Job seeker (membership)                                                      */
/* -------------------------------------------------------------------------- */

/** A job seeker reserved a founding membership on /get-access. Fires from the
 *  success render, never on the click, so a failed submit never counts. `plan`
 *  mirrors membership_reservations.plan. */
export function trackMembershipReserved(plan: string, currency: string): void {
  track("membership_reserved", { plan, currency });
}
