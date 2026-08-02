import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MathBars } from "@/components/home/MathBars";

/*
  Section 5: pricing. It sits after the vetting and the sample profiles on
  purpose. The money argument is only persuasive once the quality claim has been
  shown, and a firm that does not believe the pool is real does not care what
  access to it costs.

  Layout is 2 + 1, not three equal cards: the two numbers a firm actually pays sit
  side by side, and the founding rate runs full width beneath them because it is a
  condition on both rather than a third product. Three equal columns would have
  read as a pricing table for three plans, which is the wrong idea entirely.

  MathBars is reused verbatim from the worker page. Its header comment has claimed
  since it was extracted that it exists "so it can be reused on /employers", and
  nothing ever imported it until this section. The data is reframed for a firm
  (content/firms.ts, pricing.comparison): the point being made is that of the
  $2,000 a month a firm pays an agency, about $600 reaches the person doing the
  work. That is a quality argument as much as a price one, which is why it lives
  under the fees rather than in the hero.
*/
export function Pricing() {
  const { pricing } = firms;
  const [access, success, founding] = pricing.plans;

  return (
    <section id="pricing" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{pricing.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[60ch] text-lede text-ink">
            {pricing.intro}
          </p>
        </div>

        {/* The two fees. */}
        <div className="reveal-group mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {[access, success].map((plan) => (
            <div key={plan.title} className="reveal border-t border-line pt-6">
              <h3 className="text-body font-medium text-navy">{plan.title}</h3>
              <p className="display display-figure mt-3 text-ink">
                {plan.price}
              </p>
              <p className="mt-1 text-caption text-subtle">{plan.unit}</p>
              <p className="mt-4 max-w-[44ch] text-body text-muted">
                {plan.body}
              </p>
            </div>
          ))}
        </div>

        {/* The founding rate: a condition on both fees above, so it runs the full
            width rather than sitting as a third column. */}
        <div className="reveal mt-10 rounded-card border border-line bg-mist p-6 lg:p-8">
          <h3 className="text-body font-medium text-navy">{founding.title}</h3>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="display display-figure text-ink">{founding.price}</p>
            <p className="text-caption text-subtle">{founding.unit}</p>
          </div>
          <p className="mt-4 max-w-[62ch] text-body text-muted">
            {founding.body}
          </p>
        </div>

        {/*
          The arithmetic, immediately after the three prices, because that is the
          order a partner reads them in: what it costs, then what it costs against.

          Set at reading size on a hairline rather than in a tinted callout. A box
          would make it look like the pitch; it is meant to look like a footnote
          somebody checked. The caption under it marks the staffing range as
          illustrative, which is the part that would otherwise read as a quote.
        */}
        <div className="reveal mt-12 max-w-[820px] border-t border-line pt-6">
          <p className="max-w-[62ch] text-body text-ink">
            {pricing.arithmetic.body}
          </p>
          <p className="mt-3 max-w-[62ch] text-caption text-subtle">
            {pricing.arithmetic.caption}
          </p>
        </div>

        {/* What the fees are not. The three sentences a firm burned by an agency
            is actually scanning for. */}
        <div className="reveal mt-14 max-w-[820px]">
          <h3 className="text-body font-medium text-ink">
            {pricing.termsLabel}
          </h3>
          <ul className="mt-4">
            {pricing.terms.map((term) => (
              <li
                key={term}
                className="border-t border-line py-4 text-body text-muted"
              >
                {term}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <MathBars comparison={pricing.comparison} />
          <p className="reveal mt-6 max-w-[64ch] text-caption text-subtle">
            {pricing.comparison.caption}
          </p>
        </div>
      </Container>
    </section>
  );
}
