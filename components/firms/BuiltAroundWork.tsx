import { firms } from "@/content/firms";
import { networkPrinciples } from "@/content/passport";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

/*
  Section 5: what kind of network this is, and what it deliberately is not.

  Three of the four principles are not built. They carry their status individually
  rather than the section carrying one blanket caveat, because a reader who cares
  about vouches and skims the rest has to hit the label on vouches specifically.

  bg-paper: this sits between two white bands and needs to be one of them or the
  page runs four white sections together.
*/
export function BuiltAroundWork() {
  const { principles } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">
            {principles.heading}
          </SectionHeading>
          <p className="reveal mt-5 max-w-[62ch] text-lede text-ink">
            {principles.intro}
          </p>
        </div>

        <div className="mt-12">
          <FeatureGrid items={networkPrinciples} columns={2} />
        </div>
      </Container>
    </section>
  );
}
