import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 3: what Verified means. The longest section on the page, deliberately,
  because it is the one the whole offer rests on. A firm is being asked to trust
  strangers with client files; this is where that trust is either earned in
  specifics or lost in adjectives.

  Layout is a two-column ledger rather than the checked grid this component used
  to render. Each check now carries a real paragraph (what we ask, and what a firm
  gets to see), and a checkmark grid cannot hold a paragraph without turning into
  a wall. Title left, body right, one hairline per row.

  One hairline per row, border-t only. A list with both border-t and border-b on
  every item doubles every internal rule, which is the spec-sheet look this site
  avoids.

  Nothing here states a pass mark. The threshold in lib/assessment/service.ts is a
  bare literal in two places and has moved before; a number printed on a marketing
  page goes stale silently the next time it does.
*/
export function Vetting() {
  const { vetting } = firms;

  return (
    <section id="vetting" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <div className="max-w-[900px]">
          <SectionHeading className="reveal">{vetting.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-lede text-ink">
            {vetting.intro}
          </p>

          <dl className="reveal-group mt-12">
            {vetting.steps.map((step) => (
              <div
                key={step.title}
                className="reveal grid gap-y-2 border-t border-line py-7 lg:grid-cols-12 lg:gap-x-10"
              >
                <dt className="text-body font-medium text-navy lg:col-span-4">
                  {step.title}
                </dt>
                <dd className="max-w-[62ch] text-body text-muted lg:col-span-8">
                  {step.body}
                </dd>
              </div>
            ))}
          </dl>

          <p className="reveal mt-8 max-w-[68ch] text-small text-subtle">
            {vetting.note}
          </p>
        </div>
      </Container>
    </section>
  );
}
