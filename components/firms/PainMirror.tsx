import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 2. The pain mirror: short, full-width, directly under the hero. Three
  beats with generous spacing so each one lands on its own, then a pivot line that
  turns the recognition into the offer. No band (white), so it reads as a beat
  between the hero and the pillars.
*/
export function PainMirror() {
  const { painMirror } = firms;

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="max-w-[760px]">
          <SectionHeading>{painMirror.heading}</SectionHeading>

          <ul className="mt-8 space-y-5">
            {painMirror.beats.map((beat) => (
              <li key={beat} className="max-w-[62ch] text-lede text-muted">
                {beat}
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-[46ch] display text-[1.6rem] leading-snug text-navy">
            {painMirror.pivot}
          </p>
        </div>
      </Container>
    </section>
  );
}
