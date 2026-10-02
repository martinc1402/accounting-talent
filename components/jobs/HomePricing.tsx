"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { pricing } from "@/content/jobs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusLabel } from "@/components/marketing/StatusLabel";
import { CurrencyToggle, PlanGrid } from "@/components/jobs/PlanGrid";
import { useCurrency } from "@/components/jobs/currency";

/*
  Homepage pricing (#pricing). A client component only because the currency
  switch re-renders the grid; the page around it stays static.

  Every plan button goes to /get-access carrying ?plan= and ?currency=, which that
  page reads on the client. There is no checkout: the label says "Reserve", never
  "Get" or "Buy" (lib/content/ctas.test.ts holds that rule for the firm side, and
  it applies here for the same reason).

  TODO(payments): when Razorpay (INR, UPI + cards) / Stripe (USD) checkout
  exists, these buttons become the checkout entry point and /get-access becomes
  the founding-discount claim page. Publish refund + cancellation terms first.
*/
export function HomePricing() {
  const [currency, setCurrency] = useCurrency();

  return (
    <section id="pricing" className="scroll-mt-24 bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <SectionHeading>{pricing.heading}</SectionHeading>
            <StatusLabel status="planned" />
          </div>
          <p className="mt-5 max-w-[56ch] text-body text-muted">{pricing.sub}</p>
        </div>

        <div className="mt-8">
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        <div className="mt-6">
          <PlanGrid
            currency={currency}
            renderCta={(plan, flagged) => (
              <Button
                href={`/get-access?plan=${plan.id}&currency=${currency.toLowerCase()}`}
                variant={flagged ? "primary" : "outline"}
                className="w-full"
              >
                {pricing.ctaPrefix} {plan.name.toLowerCase()}
              </Button>
            )}
          />
        </div>

        <p className="mt-5 max-w-[70ch] text-caption text-subtle">
          {pricing.payment[currency]}
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h3 className="text-body font-medium text-ink">
              {pricing.includesHeading}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {pricing.includes.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Check
                    size={16}
                    weight="light"
                    aria-hidden
                    className="mt-1 shrink-0 text-navy"
                  />
                  <span className="text-small text-muted">{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[56ch] text-small text-muted">
              <span className="font-medium text-ink">{pricing.free.heading}: </span>
              {pricing.free.body}
            </p>
          </div>

          {/* The founding-member note. Friendly and short: these are people we
              made a promise to, and the promise stands. */}
          <aside className="rounded-card border border-line bg-white p-6 lg:col-span-5 lg:p-7">
            <h3 className="text-body font-medium text-navy">
              {pricing.founding.heading}
            </h3>
            <p className="mt-3 text-small text-muted">{pricing.founding.body}</p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
