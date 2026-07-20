import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 6 (#how-it-works). The same step rail the homepage "How it works" uses,
  a dot per step joined by a line that stops at the last dot, but this one is
  employer-facing (Search / Interview / Hire and pay directly) and drops the
  worker search panel. This page's nav "How it works" item points here.

  The steps are labelled by their verb, no "Step 1 / Step 2": the vertical order
  and the rail already carry the sequence.
*/
export function HiringSteps() {
  const { hiring } = firms;

  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <SectionHeading>{hiring.heading}</SectionHeading>

        <ol className="mt-10 max-w-[760px]">
          {hiring.steps.map((step) => (
            <li
              key={step.title}
              className="group relative grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7"
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className="mt-2 size-2.5 shrink-0 rounded-full bg-navy"
                />
                <span
                  aria-hidden
                  className="w-px flex-1 bg-line group-last:hidden"
                />
              </div>

              <div className="min-w-0 pb-10 group-last:pb-0">
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
