"use client";

import { Button } from "@/components/ui/Button";
import { trackPlanSelected, type PlanId } from "@/lib/analytics";

/*
  A pricing CTA that carries its plan down to the intake form.

  WHY A CUSTOM EVENT rather than a query string. "/" is fully static, and
  app/page.tsx records that this is load-bearing: "Reinstating anything that reads
  Supabase means putting a revalidate back." Reading ?plan= on the server would
  make the route dynamic; reading it on the client would still cost a full
  navigation and scroll jump for what is an in-page anchor.

  So this dispatches at:plan-select and EmployerBrief listens. That is not a new
  pattern here: components/profile/CandidateActions.tsx already syncs save state
  across component instances with an at:candidate-save CustomEvent.

  DEGRADES CLEANLY. The href is a real anchor, so with JavaScript off (or before
  hydration) the button still scrolls to the form. The reader just picks the
  service themselves from a select that is right there. Nothing is broken, one
  field is unfilled.

  There is no checkout behind any of this. Every plan CTA lands on the same form.
*/
export function PlanCta({
  plan,
  label,
  href,
  variant = "primary",
}: {
  plan: PlanId;
  label: string;
  href: string;
  variant?: "primary" | "outline" | "inverse";
}) {
  return (
    <Button
      href={href}
      variant={variant}
      onClick={() => {
        trackPlanSelected(plan);
        window.dispatchEvent(
          new CustomEvent("at:plan-select", { detail: { plan } }),
        );
      }}
    >
      {label}
    </Button>
  );
}
