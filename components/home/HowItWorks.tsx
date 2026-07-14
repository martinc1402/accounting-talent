import { hero, howItWorks } from "@/content/home";
import { FirmView } from "@/components/home/FirmView";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Spark's signature section shape: the headline sticks to the left while the
  rows scroll past on the right. The rows carry real content, not filler, which
  is what earns the split.

  The steps are labelled by their verb. No "Step 1 / Step 2" numbering: the
  vertical order already says everything a number would. The rail says the same
  thing visually. A dot per step on a single continuous line gives the reader
  sequence and progress without stamping a number on anything, and it is the one
  piece of structure this section was missing: it is where a sceptical reader
  decides the thing is real, and it used to be three paragraphs and two rules.

  The sticky column now carries the CTA. Reading the three steps is exactly the
  moment someone decides to apply, and the column was otherwise 500px of nothing.
*/
export function HowItWorks() {
  return (
    // Shares the white band with TheMath above it: the two sections are one
    // argument (here is the gap, here is how you close it) and striping them
    // apart was making the page feel like a checklist of blocks.
    <section id="how-it-works" className="scroll-mt-20 pb-16 lg:pb-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading>{howItWorks.h2}</SectionHeading>
            <p className="mt-5 max-w-[34ch] text-lede text-muted">
              {howItWorks.sub}
            </p>

            {/* Same label as the hero and the closing CTA. One intent, one label. */}
            <div className="mt-8 hidden lg:block">
              <Button href="/apply">{hero.cta}</Button>
            </div>

            {/* The search a firm runs, shown next to the steps that describe it.
                This column used to be ~400px of nothing below the CTA. */}
            <div className="mt-10 hidden lg:block">
              <FirmView />
            </div>
          </div>
        </div>

        <ol className="reveal-group lg:col-span-7">
          {howItWorks.steps.map((step) => (
            <li
              key={step.title}
              // The row padding lives on the text column, not here: a grid item
              // only spans the content box, so padding on the <li> would stop
              // the rail short and leave a gap above the next dot.
              className="reveal group relative grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7"
            >
              {/*
                The rail. A dot per step, joined by a line that stops at the last
                dot rather than trailing off the end of the list.
              */}
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
                <p className="mt-3 max-w-[52ch] text-body text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Below lg the sticky column collapses, so its contents come after the
            steps instead. The search view follows the steps here rather than
            leading them: on a phone the reader wants the three steps first. */}
        <div className="lg:hidden">
          <FirmView />

          <div className="mt-8">
            <Button href="/apply" className="w-full sm:w-auto">
              {hero.cta}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
