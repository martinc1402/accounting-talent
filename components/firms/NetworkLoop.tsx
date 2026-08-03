import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";

/*
  Section 4: the network effect.

  NO DIAGRAM. The obvious build here is a circular four-node SVG with arrows, and
  it is the wrong one. This site has rejected that kind of thing twice already for
  the same reason: ProfileDetail replaced a full-bleed photograph because "the
  photo broke the scroll but made no argument", and the sample cards replaced
  silhouettes for a related reason. A loop diagram is decoration that restates the
  heading, costs a hand-rolled SVG, and says nothing the four steps do not.

  So it is the site's own step rail, with a closing line that names the loop. The
  fourth step's body already says it feeds the first; `close` says what the loop
  is FOR, which is the part a firm cares about.

  Steps carry no capability status here on purpose. This section describes how the
  network is meant to work rather than what a firm can do this afternoon, and the
  section directly below (`hiring`) is where per-step status belongs. Marking
  every step "Launching soon" here would be technically true and would turn the
  argument into a disclaimer.
*/
export function NetworkLoop() {
  const { loop } = firms;

  return (
    <section className="py-16 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {/* Sticky, matching HowItWorks on the accountant page: the claim stays
              on screen while the evidence for it scrolls past. */}
          <div className="lg:sticky lg:top-32">
            <SectionHeading className="reveal">{loop.heading}</SectionHeading>
            <p className="reveal mt-6 max-w-[38ch] text-body text-muted">
              {loop.close}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ProcessSteps steps={loop.steps} />
        </div>
      </Container>
    </section>
  );
}
