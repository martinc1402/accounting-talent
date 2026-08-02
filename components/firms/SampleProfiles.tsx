import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProfileCard } from "@/components/home/ProfileCard";

/*
  Section 4: what is in the database. The strongest thing on the page, because it
  is the only section that shows the product instead of describing it.

  Reuses ProfileCard rather than building a firm-side lookalike. The component was
  parameterized for exactly this ("so /employers can render a grid of these") and
  never actually used that way until now; sharing it is what stops the marketing
  card and the real profile card from drifting into two different products.

  The profiles carry no `photo`, so ProfileCard falls back to its silhouette. That
  is deliberate and it is the same reasoning the silhouette was written for:
  putting an invented face on a fictional person is the overstatement this site
  exists not to make. Names are first-name-plus-initial, which is also how a gated
  profile reads to a firm before an introduction is approved.

  "Sample" is said three times: in the section intro, on a caption under every
  card, and in the hero caption above. A firm skimming this page must not come
  away believing these are three people it can contact today.
*/
export function SampleProfiles() {
  const { database } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{database.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-body text-muted">
            {database.intro}
          </p>
        </div>

        {/* 3 items, 3 cells, no filler tile. Single column below sm. */}
        <ul className="reveal-group mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {database.profiles.map((profile) => (
            <li key={profile.name} className="reveal">
              <ProfileCard profile={profile} sample />
            </li>
          ))}
        </ul>

        {/* The image disclosure sits first and on its own line, above the
            software trademark note rather than merged into it. Same small-print
            size, but a reader scanning for what these faces are should hit it
            before boilerplate about product names. */}
        <p className="mt-10 max-w-[72ch] text-caption text-subtle">
          {database.imageNote}
        </p>
        <p className="mt-2 max-w-[64ch] text-caption text-subtle">
          {database.note}
        </p>
      </Container>
    </section>
  );
}
