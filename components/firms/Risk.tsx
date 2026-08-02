import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 2. The objection, stated before the offer: short, full-width, directly
  under the hero. Three beats set in the display serif with generous space between
  them so each lands on its own, then a pivot line that is larger and navy-italic
  so it reads as the turn into the answer. Its own pale (mist) band, distinct from
  the white hero above and the white vetting section below.

  This was PainMirror, which opened on the staffing shortage and the agency
  margin. It leads on risk now. A firm owner's first question about an overseas
  hire is who this person is, not what they cost, and a page that answers the
  cheaper question first reads as though it misheard the expensive one.

  pb-1 on the pivot reserves space for the italic descender in "problem"; at
  leading-[1.3] with no reserve it clips against the section padding.
*/
export function Risk() {
  const { risk } = firms;

  return (
    <section className="bg-mist py-16 lg:py-24">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading>{risk.heading}</SectionHeading>

          {/* Beats: display serif, ~22px mobile / ~28px desktop, line-height 1.3,
              ~32-36px apart. */}
          <ul className="mt-10 space-y-8 lg:space-y-9">
            {risk.beats.map((beat) => (
              <li
                key={beat}
                className="display max-w-[38ch] text-[1.4rem] leading-[1.3] text-muted lg:text-[1.75rem]"
              >
                {beat}
              </li>
            ))}
          </ul>

          <p className="display mt-12 max-w-[40ch] pb-1 text-[1.5rem] leading-[1.3] text-navy italic lg:text-[1.9rem]">
            {risk.pivot}
          </p>
        </div>
      </Container>
    </section>
  );
}
