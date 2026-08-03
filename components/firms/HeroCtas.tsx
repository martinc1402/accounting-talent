"use client";

import { firms } from "@/content/firms";
import { Button } from "@/components/ui/Button";
import { trackEmployerExplore, trackEmployerPostRole } from "@/lib/analytics";

/*
  The hero's two buttons. BOTH go to the intake form.

  "Post a role free" is primary now. It used to be secondary, behind an "Explore
  talent" button that scrolled to the example profiles at #network, which made the
  page's most prominent button a non-converting one: it moved a reader down the
  page rather than into the only thing on it that captures intent.

  The secondary button shares the destination and keeps its own event, which is
  the point of keeping it rather than deleting it. Two firms arrive at the same
  form from different states of mind, and employer_post_role_clicked against
  employer_explore_clicked is what tells them apart. If that split stops earning
  its place, delete the second button rather than repointing it somewhere it can
  pretend to go.

  Posting a role is not self-serve yet, and the label is still honest: the form is
  where a firm says what it needs, and the status on that step in HowHiringWorks
  says plainly that we set it up from the brief.

  Client only for the two track() calls. Everything else in the hero is server
  rendered, matching how <Cta> has always been the one client leaf in the header.
*/
export function HeroCtas() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        href={firms.reserve.href}
        onClick={() => trackEmployerPostRole("hero")}
      >
        {firms.reserve.label}
      </Button>
      <Button
        href={firms.secondary.href}
        variant="outline"
        onClick={() => trackEmployerExplore("hero")}
      >
        {firms.secondary.label}
      </Button>
    </div>
  );
}
