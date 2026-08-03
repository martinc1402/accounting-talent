"use client";

import { hero, exampleProfile } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { trackAccountantJoin, trackExampleProfile } from "@/lib/analytics";
import type { Surface } from "@/lib/analytics";

/*
  The accountant page's two calls to action, used in the hero and again on the
  closing band.

  "See what employers see" goes to /candidates/preview, which is a REAL page: it
  renders the real CandidateProfile component through the real server-side
  projection in lib/authz/projectCandidate.ts. An accountant clicking it sees the
  actual thing a firm would see, at an actual visibility level, rather than a
  drawing of it. That is the strongest possible answer to "what will be public
  about me", which is the question this audience asks first.

  Client only for the two track() calls. `surface` distinguishes the hero click
  from the closing-band click, since they are answering different amounts of
  reading.
*/
export function JoinCtas({
  surface = "hero",
  tone = "light",
}: {
  surface?: Surface;
  tone?: "light" | "onNavy";
}) {
  const onNavy = tone === "onNavy";

  // No top margin of its own: callers place it. The hero and the closing band
  // sit at different rhythms and a baked-in mt would fight one of them.
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        href="/apply"
        variant={onNavy ? "inverse" : "primary"}
        className="w-full sm:w-auto"
        onClick={() => trackAccountantJoin(surface)}
      >
        {hero.cta}
      </Button>
      <Button
        href={exampleProfile.href}
        variant={onNavy ? "outlineInverse" : "outline"}
        className="w-full sm:w-auto"
        onClick={() => trackExampleProfile(surface)}
      >
        {hero.secondaryCta}
      </Button>
    </div>
  );
}
