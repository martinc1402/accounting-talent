/*
  One entry point for firing Meta Pixel standard events.

  It no-ops unless window.fbq exists. The pixel only loads in production, on
  non-/assessment pages (see components/analytics/MetaPixel.tsx, gated in
  app/layout.tsx), so every caller here is automatically silent in preview,
  local dev, and on assessment pages — no per-call environment checks needed.

  Bare standard events only: never pass a params object. We deliberately send no
  email, name, salary, or any other applicant data to Meta — only that an event
  happened.
*/

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaEvent = "PageView" | "Lead" | "CompleteRegistration";

export function trackMeta(event: MetaEvent): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event);
  }
}

/*
  CompleteRegistration is intentionally unwired today: there is no
  email-verification success page yet (Stage 1 email verification was deferred).
  When a /verify success page ships, fire it from that page's success render with
  a single call — nothing else here needs to change:

    trackMeta("CompleteRegistration");
*/
