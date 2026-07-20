import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 6 (#how-it-works). Employer-facing steps (Search / Interview / Hire and
  pay directly). This page's nav "How it works" item points here.

  Large serif numerals carry the sequence: the display-stat size (the same big-
  number treatment the salary figures use) in a muted navy, so the number
  structures each step without competing with its title. The <ol> keeps the order
  semantic, so the visible numerals are decorative (aria-hidden).
*/
export function HiringSteps() {
  const { hiring } = firms;

  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <SectionHeading>{hiring.heading}</SectionHeading>

        <ol className="mt-10 max-w-[760px]">
          {hiring.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[auto_1fr] gap-x-5 pb-10 last:pb-0 sm:gap-x-8"
            >
              <span
                aria-hidden
                className="display display-stat leading-none text-navy/30 tabular-nums"
              >
                {i + 1}
              </span>

              <div className="min-w-0 pt-1">
                <h3 className="display display-step text-navy">{step.title}</h3>
                <p className="mt-3 max-w-[62ch] text-body text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
