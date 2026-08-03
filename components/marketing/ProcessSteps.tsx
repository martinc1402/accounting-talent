import type { CapabilityStatus } from "@/content/passport";
import { StatusLabel } from "@/components/marketing/StatusLabel";

/*
  The dot-and-rail step list, lifted verbatim out of HowItWorks so both pages can
  use it. Four places now want sequence: how hiring works, the network loop, how
  the network works, and the accountant's build-your-profile steps.

  RENDERS THE <ol> ONLY. Not the heading, not the sticky aside. That follows the
  precedent MathBars set explicitly ("This renders the bars only, not the caption:
  callers own the caption"), and it is what lets HowItWorks keep its sticky
  FirmView column while "/" uses the same rail with no aside at all.

  Steps are labelled by their verb, never numbered. The vertical order already
  says everything a number would, and the rail says it visually. "Step 1 / Step 2"
  stamped on top of both is the third telling of the same fact.
*/
export type ProcessStep = {
  title: string;
  body: string;
  status?: CapabilityStatus;
};

export function ProcessSteps({ steps }: { steps: readonly ProcessStep[] }) {
  return (
    <ol className="reveal-group">
      {steps.map((step) => (
        <li
          key={step.title}
          /*
            The row padding lives on the text column, not here: a grid item only
            spans the content box, so padding on the <li> would stop the rail
            short and leave a gap above the next dot.
          */
          className="reveal group relative grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7"
        >
          {/* A dot per step, joined by a line that stops at the last dot rather
              than trailing off the end of the list. */}
          <div className="flex flex-col items-center">
            <span
              aria-hidden
              className="mt-2 size-2.5 shrink-0 rounded-full bg-navy"
            />
            <span aria-hidden className="w-px flex-1 bg-line group-last:hidden" />
          </div>

          <div className="min-w-0 pb-10 group-last:pb-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="display display-step text-navy">{step.title}</h3>
              {step.status && <StatusLabel status={step.status} />}
            </div>
            <p className="mt-3 max-w-[52ch] text-body text-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
