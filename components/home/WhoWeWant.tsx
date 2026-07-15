import { whoWeWant } from "@/content/home";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Five candidate profiles, one card style. This used to be five different
  treatments (cream, navy, photo-background, grey, coral), which made the grid
  read as decoration and told the reader nothing: the colours did not encode
  anything, so the eye had to work out that all five cells were equal.

  Exactly one card is navy now, and it says why. "Offshore firm staff on US
  clients" are the people the business most wants, so they get the one
  highlighted card and a "Priority profile" badge to name the highlight.

  Two columns on desktop, one on mobile. The cards stretch to equal heights per
  row, which is what stops five different body lengths from producing five
  different card heights.
*/
export function WhoWeWant() {
  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="reveal max-w-[64ch]">
          <SectionHeading kicker="Who it's for">{whoWeWant.h2}</SectionHeading>
          {/* 62ch, not 54: the narrower measure forced this three-line intro into
              a cramped shape. 62ch also matches TheMath's lead-in, which is the
              directly comparable section intro at the same text-lede size. */}
          <p className="mt-5 max-w-[62ch] text-lede text-muted">
            {whoWeWant.sub}
          </p>
        </div>

        <div className="reveal-group mt-12 grid items-stretch gap-4 md:grid-cols-2">
          {whoWeWant.profiles.map((profile) => {
            const tone = profile.priority ? "feature" : "default";
            return (
              <div key={profile.title} className="reveal h-full">
                <Card tone={tone}>
                  {profile.priority && (
                    <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-caption font-medium tracking-wide text-white">
                      {whoWeWant.priorityBadge}
                    </p>
                  )}
                  <CardTitle>{profile.title}</CardTitle>
                  <CardBody tone={tone}>{profile.body}</CardBody>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Rate card. A strip, not a spec table: three figures and a caveat. */}
        <div className="reveal mt-14">
          <Card>
            <CardTitle>{whoWeWant.rates.intro}</CardTitle>

            <dl className="mt-7 grid gap-7 sm:grid-cols-3 sm:gap-6">
              {whoWeWant.rates.bands.map((band) => (
                <div key={band.role}>
                  <dd className="display display-figure text-navy">
                    {band.range}
                  </dd>
                  <dt className="mt-2 max-w-[24ch] text-caption text-muted">
                    {band.role}
                  </dt>
                </div>
              ))}
            </dl>

            <p className="mt-7 border-t border-line pt-5 text-caption text-subtle">
              {whoWeWant.rates.note}
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}
