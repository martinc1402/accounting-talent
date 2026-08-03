import { reputation } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

/*
  Why a professional record beats a résumé. Sits between the hero and the
  Passport, so the Passport arrives as the answer to a question the reader has
  just been given rather than as a feature list.

  Two of the four points are not built. They carry their own status, and one of
  them ("Show practical work") is the most attractive claim on the page, which is
  exactly why it must not be the one that quietly goes unlabelled.
*/
export function WhyReputation() {
  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[900px]">
          <SectionHeading className="reveal">{reputation.h2}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-lede text-ink">
            {reputation.sub}
          </p>
        </div>

        <div className="mt-12">
          <FeatureGrid items={reputation.points} columns={2} />
        </div>
      </Container>
    </section>
  );
}
