import { workNotPopularity } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

/*
  The anti-LinkedIn section.

  It is short and it earns its place by being a commitment rather than a boast:
  every line says what we will NOT do to rank people. For an audience that has
  been charged by everyone else in this market, a promise not to sell ranking is
  worth more than another description of a feature.

  No status labels here, deliberately, and this is the one place that omission is
  correct. These are not capabilities waiting to be built. They are constraints on
  how the product may be built, and they are true today because there is no
  ranking product at all. Marking them "Launching soon" would be nonsense.
*/
export function WorkNotPopularity() {
  return (
    <section className="py-16 lg:py-28">
      <Container>
        <div className="max-w-[900px]">
          <SectionHeading className="reveal">
            {workNotPopularity.h2}
          </SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-lede text-ink">
            {workNotPopularity.sub}
          </p>
        </div>

        <div className="mt-12">
          <FeatureGrid items={workNotPopularity.principles} columns={3} />
        </div>
      </Container>
    </section>
  );
}
