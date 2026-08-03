import { firms } from "@/content/firms";
import { employerPlans, ongoingHiring, pricingNote } from "@/content/passport";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingCard } from "@/components/marketing/PricingCard";
import { PlanCta } from "@/components/marketing/PlanCta";

/*
  Section 8: pricing.

  THIS REVERSES A RECORDED DECISION and the old reasoning deserves stating rather
  than quietly deleting. This section used to lay out 2 + 1 (two fees side by
  side, the founding rate full width beneath) and its comment argued: "Three equal
  columns would have read as a pricing table for three plans, which is the wrong
  idea entirely." That was correct for the old model, which was one annual access
  fee plus one per-hire success fee. Two numbers a firm pays are not three
  products to choose between, and columning them would have invented a choice
  that did not exist.

  The model is now genuinely three products at three prices, and a firm picking
  its first step needs them side by side. The old objection does not apply to the
  new offer.

  MathBars is gone from this page with the fee model. It compared what a firm pays
  an agency against what reaches the accountant, which was an argument about
  agency margin and belonged to a pricing model built around undercutting one. It
  still runs on /accountants, where the direct-hiring economics are the
  accountant's argument and the comparison is the point of the section.

  NO CHECKOUT EXISTS. There is no payment dependency anywhere in this repo. Every
  CTA below lands on the intake form with its plan preselected, and the paid ones
  say "Reserve", not "Get". content/passport.ts enforces the rest: a plan feature
  that is not built cannot be given a working link.

  The ongoing-hiring block is deliberately NOT a fourth card. It is a hairline
  block underneath, because a firm choosing its first step should be choosing
  between three things and not six.
*/
export function Pricing() {
  const { pricing } = firms;

  return (
    <section id="pricing" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{pricing.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[60ch] text-lede text-ink">
            {pricing.intro}
          </p>
        </div>

        {/* 3 items, 3 cells. items-stretch so the flagged card does not stand
            taller than its neighbours; PricingCard pins its own CTA to the
            bottom with mt-auto so the three buttons share a baseline. */}
        <ul className="reveal-group mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {employerPlans.map((plan) => (
            <li key={plan.id} className="h-full">
              <PricingCard plan={plan} />
            </li>
          ))}
        </ul>

        <p className="reveal mt-10 max-w-[72ch] text-small text-subtle">
          {pricingNote}
        </p>

        {/* The secondary tier. Hairline, no card, no price display type: it must
            not compete with the three offers above it. */}
        <div className="reveal mt-14 max-w-[820px] border-t border-line pt-8">
          <h3 className="text-body font-medium text-ink">
            {ongoingHiring.heading}
          </h3>
          <ul className="mt-4 space-y-2">
            {ongoingHiring.options.map((option) => (
              <li key={option} className="max-w-[62ch] text-body text-muted">
                {option}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PlanCta
              plan="ongoing"
              label={ongoingHiring.action.label}
              href={ongoingHiring.action.href}
              variant="outline"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
