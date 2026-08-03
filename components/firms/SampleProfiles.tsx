import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProfileCard } from "@/components/home/ProfileCard";

/*
  Section 7: inside the network. The strongest thing on the page, because it is
  the only section that shows the product instead of describing it.

  Reuses ProfileCard rather than building a firm-side lookalike. The component was
  parameterized for exactly this ("so /employers can render a grid of these") and
  sharing it is what stops the marketing card and the real profile card from
  drifting into two different products.

  CORRECTION TO A STALE COMMENT THAT USED TO LIVE HERE. It claimed "the profiles
  carry no `photo`, so ProfileCard falls back to its silhouette", and that had
  been false for some time: all three profiles in content/firms.ts carry a photo.
  This is precisely the failure ProfileCard's own header warns about, where a
  later rewrite reinstated silhouettes across this page "on the strength of a
  stale comment" and had to be reversed in c615c59. The decision that stands:
  sample cards use real portraits, gender-matched to the name, and the honesty
  work is done by an explicit "Example" chip on the card plus the note below. A
  grid of grey silhouettes reads as an unfinished page, not as a scrupulous one.

  The disclosure is no longer this component's to forget. ProfileCard REQUIRES an
  `example` prop, so a card cannot render here undisclosed.

  NO CTA IN THIS SECTION. It briefly carried a "See a full example profile" link
  to /candidates/preview. Every call to action on this page now goes to the intake
  form, and a link out to a preview page was the one remaining path that led a
  reader somewhere else. The preview page still exists and is still reachable from
  /accountants ("See what employers see"), where showing an accountant what a firm
  sees is the actual argument rather than a detour.

  `note` is the section's own, longer admission, and it must not be trimmed. Some
  evidence shown on these cards (Work Proof, vouch counts) describes parts of the
  Passport that are NOT BUILT. Showing the format is fine; showing it without
  saying so, next to the cards, would not be.
*/
export function SampleProfiles() {
  const { network } = firms;

  return (
    <section id="network" className="scroll-mt-24 bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{network.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-body text-muted">
            {network.intro}
          </p>
        </div>

        {/* 3 items, 3 cells, no filler tile. Single column below sm. */}
        <ul className="reveal-group mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {network.profiles.map((profile) => (
            <li key={profile.name} className="reveal">
              <ProfileCard
                profile={profile}
                sample
                example={{ chip: network.exampleChip }}
              />
            </li>
          ))}
        </ul>

        {/* The example disclosure sits first and on its own line, above the
            software trademark note rather than merged into it. Same small-print
            size, but a reader scanning for what these faces are should hit it
            before boilerplate about product names. */}
        <p className="mt-10 max-w-[76ch] text-caption text-subtle">
          {network.note}
        </p>
        <p className="mt-2 max-w-[64ch] text-caption text-subtle">
          {network.trademarks}
        </p>
      </Container>
    </section>
  );
}
