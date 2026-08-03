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

/** Where a primary CTA was clicked. `hero` is the nav CTA at the top of the
 *  page; `final` the closing band; `sticky` the mobile bar. */
export type CtaPosition = "hero" | "final" | "sticky";

export function trackCta(position: CtaPosition): void {
  track("cta_click", { position });
}

/*
  Surface, and deliberately NOT CtaPosition.

  cta_click has historical data keyed on exactly three values. Widening that union
  would silently change what an existing dashboard filter means, which is worse
  than a slightly redundant type. New events get their own vocabulary.
*/
export type Surface =
  | "hero"
  | "nav"
  | "pricing"
  | "passport"
  | "network"
  | "final";

/*
  The shared plan vocabulary. This exact union also appears as content/passport.ts
  PlanId and as the preferred_service column on employer_leads (migration 0021).
  One list across the page, the funnel and the table, so a lead's stated intent
  and its recorded intent cannot disagree.

  Restated here rather than imported so lib/ does not depend on content/. If you
  add a fourth plan, add it in both places; the CTA test asserts they match.
*/
export type PlanId =
  | "free-exploration"
  | "hiring-pass"
  | "curated-shortlist"
  | "ongoing";

/* -------------------------------------------------------------------------- */
/* Employer                                                                     */
/* -------------------------------------------------------------------------- */

/** A firm went looking at talent (the network section or an example profile). */
export function trackEmployerExplore(surface: Surface): void {
  track("employer_explore_clicked", { surface });
}

/** A firm clicked "Post a role free". */
export function trackEmployerPostRole(surface: Surface): void {
  track("employer_post_role_clicked", { surface });
}

/** A firm chose a plan on the pricing section. Fires on the click that carries
 *  the choice into the form, not on scroll. */
export function trackPlanSelected(plan: PlanId): void {
  track("employer_plan_selected", { plan });
}

/** A firm opened a real example profile. Fires on the click through to
 *  /candidates/preview, so it measures intent rather than scroll depth. */
export function trackExampleProfile(surface: Surface): void {
  track("example_profile_viewed", { surface });
}

/*
  An employer submitted the intake form: the one conversion on "/".

  ONE EVENT, SEGMENTED, rather than the three separate submit events
  (hiring_pass_interest_submitted / curated_shortlist_requested /
  founding_employer_submitted) the brief asked for. There is one form writing one
  table, so three names would fragment the funnel and could drift from the
  preferred_service column that records the same fact. `service` answers all three
  questions off a single number.

  The event name stays `lead_submit` deliberately: it is what the current smoke
  test reads off the Vercel dashboard, and renaming it would orphan that history.
*/
export function trackLeadSubmit(service: PlanId): void {
  track("lead_submit", { service });
}

/* -------------------------------------------------------------------------- */
/* Accountant                                                                   */
/* -------------------------------------------------------------------------- */

/** An accountant clicked through to the application. */
export function trackAccountantJoin(surface: Surface): void {
  track("accountant_join_clicked", { surface });
}

/** An accountant completed the application wizard. */
export function trackAccountantApplication(): void {
  track("accountant_application_submitted");
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                       */
/* -------------------------------------------------------------------------- */

/** An FAQ item was opened. `id` is the kebab-case id authored in content/faq.ts,
 *  never the question text. */
export function trackFaqOpened(id: string): void {
  track("faq_opened", { id });
}

/* -------------------------------------------------------------------------- */
/* Dormant                                                                      */
/* -------------------------------------------------------------------------- */

/*
  These three are only reachable from components/firms/FoundingForm.tsx, which is
  rendered nowhere. They are kept rather than deleted because retiring the
  firm_waitlist path is a separate decision from this rewrite, and deleting the
  helpers first would leave that component unbuildable. If FoundingForm goes,
  these go with it in the same commit.
*/
export function trackEmailSubmit(): void {
  track("email_submit");
}

export function trackRoleChip(role: string): void {
  track("chip_role_selected", { role });
}

export function trackTimingChip(timing: string): void {
  track("chip_timing_selected", { timing });
}
