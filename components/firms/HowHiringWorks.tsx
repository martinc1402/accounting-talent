import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";

/*
  Section 6: how hiring actually works, in order, with each step carrying its own
  capability status.

  THIS IS THE MOST LOAD-BEARING SECTION ON THE PAGE for honesty. It is where a
  firm forms a plan, and two of the four steps do not exist yet. Search and
  filters are not built (there is no candidate directory route at all), and job
  posting is not built. Both say so on their face, next to the step, rather than
  in a footnote at the bottom of the page.

  A "Launching soon" label here is not a soft claim about a working feature. It
  means the step does not exist, and a firm reading this is entitled to know that
  before it plans a busy season around it.

  This file replaced Vetting.tsx, which explained what "Verified" meant across
  five checks. That argument did not disappear: it moved into the Passport section
  (foundations pillar) and into lib/marketing/verificationLevels.ts, which is now
  unit-tested against the checks the app can actually stamp. The id changed from
  #vetting to #how-hiring-works, and content/site.ts navItems changed with it in
  the same commit. Nothing type-checks section ids, so if you rename this one,
  grep content/site.ts and StickyCtaBar before you finish.
*/
export function HowHiringWorks() {
  const { hiring } = firms;

  return (
    <section id="how-hiring-works" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{hiring.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[62ch] text-lede text-ink">
            {hiring.intro}
          </p>
        </div>

        <div className="mt-12 max-w-[900px]">
          <ProcessSteps steps={hiring.steps} />
        </div>
      </Container>
    </section>
  );
}
