import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 2. The pain mirror: short, full-width, directly under the hero. Three
  beats set in the display serif with generous space between them so each lands on
  its own, then a pivot line that is larger and navy-italic so it reads as the turn
  into the offer. Its own pale (mist) band, distinct from the white hero above and
  the cream pillars below.
*/
export function PainMirror() {
  const { painMirror } = firms;

  return (
    <section className="bg-mist py-16 lg:py-24">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading>{painMirror.heading}</SectionHeading>

          {/* Beats: display serif, ~22px mobile / ~28px desktop, line-height 1.3,
              ~32-36px apart. */}
          <ul className="mt-10 space-y-8 lg:space-y-9">
            {painMirror.beats.map((beat) => (
              <li
                key={beat}
                className="display max-w-[34ch] text-[1.4rem] leading-[1.3] text-muted lg:text-[1.75rem]"
              >
                {beat}
              </li>
            ))}
          </ul>

          {/* Pivot: larger than the beats, navy, serif italic. pb-1 clears the
              italic descenders. */}
          <p className="mt-12 max-w-[40ch] display text-[1.5rem] leading-[1.3] text-navy italic pb-1 lg:text-[1.9rem]">
            {painMirror.pivot}
          </p>
        </div>
      </Container>
    </section>
  );
}
