import { howItWorks } from "@/content/home";
import { FirmView } from "@/components/home/FirmView";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";

/*
  The headline sticks to the left while the steps scroll past on the right. The
  steps carry real content, not filler, which is what earns the split.

  Four steps now rather than three, and each carries its own capability status.
  Two of the four are not fully built: work samples and challenges are not open,
  and vouches do not exist at all. A reader planning to build a profile around
  vouches is entitled to know that at the step, not in a footnote.

  The rail itself moved to components/marketing/ProcessSteps so the employer page
  can use it. This component keeps the heading and the sticky aside, following
  the split MathBars set ("renders the bars only, not the caption: callers own
  the caption"), which is what lets the aside carry FirmView here and nothing on
  the employer page.

  Steps are labelled by their verb. No "Step 1 / Step 2" numbering: the vertical
  order already says everything a number would, and the rail says it visually.

  THE PRIVACY NOTE IS NOT FINE PRINT. Step two asks people to add work evidence,
  and the worst outcome this product could produce is an accountant uploading a
  client's books. It renders at reading size directly under the steps, not in the
  footer, not at caption size, and not folded into the step body where it would be
  the fourth sentence of a paragraph.
*/
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading>{howItWorks.h2}</SectionHeading>
            <p className="mt-5 max-w-[34ch] text-lede text-muted">
              {howItWorks.sub}
            </p>

            {/* What a firm sees, shown next to the steps that describe it. */}
            <div className="mt-10 hidden lg:block">
              <FirmView />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ProcessSteps steps={howItWorks.steps} />

          <p className="reveal mt-10 max-w-[58ch] border-l-2 border-navy pl-4 text-body text-ink">
            {howItWorks.privacyNote}
          </p>
        </div>

        {/* Below lg the sticky column collapses, so the firm view comes after
            the steps instead: on a phone the reader wants the steps first. */}
        <div className="lg:hidden">
          <FirmView />
        </div>
      </Container>
    </section>
  );
}
