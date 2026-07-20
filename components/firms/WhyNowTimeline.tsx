import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { weeksUntilNextJan1 } from "@/lib/weeks-to-jan";

/*
  Section 7 (#timeline). The "why now" band: the argument on the left, a four-step
  horizontal timeline on the right that stacks to one column on a phone. The steps
  are plain text nodes on a hairline rule, no illustration: the rule reads as the
  run-up to January, and each node is a month range.

  The opening line counts the weeks to the next 1 January. It is computed here (a
  server component); the /employers page sets `revalidate` so the static page
  regenerates and the number stays current.
*/
export function WhyNowTimeline() {
  const { timeline } = firms;
  const lead = timeline.leadTemplate.replace(
    "{weeks}",
    String(weeksUntilNextJan1()),
  );

  return (
    <section id="timeline" className="scroll-mt-24 bg-paper py-16 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="display text-[1.5rem] leading-tight text-navy">
              {lead}
            </p>
            <SectionHeading className="mt-3">{timeline.heading}</SectionHeading>
            <p className="mt-6 max-w-[46ch] text-body text-muted">
              {timeline.body}
            </p>
          </div>

          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4 lg:self-start">
            {timeline.steps.map((step) => (
              <li key={step.when} className="relative border-t border-line pt-5">
                {/* The node sitting on the rule. */}
                <span
                  aria-hidden
                  className="absolute -top-[3px] left-0 size-1.5 rounded-full bg-navy"
                />
                <p className="display text-[1.15rem] leading-none text-navy">
                  {step.when}
                </p>
                <p className="mt-3 text-small text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-14 max-w-[68ch] border-t border-line pt-8 text-body text-muted">
          {timeline.closing}
        </p>
      </Container>
    </section>
  );
}
