import { Check } from "@phosphor-icons/react/dist/ssr";
import { pricing } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusLabel } from "@/components/marketing/StatusLabel";

/*
  Accountant pricing: one free plan, and a planned Pro that is deliberately not
  sold.

  NO PAYMENT BUTTON ON PRO, and no "Join the waitlist" either. Pro is not being
  launched, so a button of any kind would be collecting intent for a product with
  no shape. It renders as a hairline block with prose, visually subordinate to the
  free plan in every respect: no card, no border, no price in display type.

  This is the accountant-side counterpart of the rule content/passport.ts enforces
  with types on the employer side. The shapes differ because the offers differ:
  the employer has three plans to choose between, the accountant has one plan and
  a note about the future.

  `critical` gets its own treatment at the end. It is the single most load-bearing
  promise on this page for an audience that has been charged by everyone else in
  this market, and it must not end up as the last line of a paragraph nobody
  finishes.
*/
export function AccountantPricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{pricing.h2}</SectionHeading>
          <p className="reveal mt-5 max-w-[62ch] text-lede text-ink">
            {pricing.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-x-16 gap-y-10 lg:grid-cols-12">
          {/* The free plan, given the full weight of a real card. */}
          <div className="reveal rounded-card border border-navy bg-white p-7 lg:col-span-7 lg:p-9">
            <h3 className="text-body font-medium text-navy">
              {pricing.free.name}
            </h3>
            <p className="display display-stat mt-3 text-ink">
              {pricing.free.price}
            </p>
            <p className="mt-1 text-caption text-subtle">{pricing.free.unit}</p>

            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {pricing.free.includes.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <Check
                    size={16}
                    weight="light"
                    aria-hidden
                    className="mt-1 shrink-0 text-navy"
                  />
                  <span className="text-small text-muted">
                    {item.text}
                    {item.status !== "live" && (
                      <span className="ml-2 inline-block align-middle">
                        <StatusLabel status={item.status} />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <ul className="mt-7 border-t border-line pt-6">
              {pricing.free.commitments.map((line) => (
                <li
                  key={line}
                  className="text-body font-medium text-ink not-first:mt-2"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro. Hairline, no card, no button. */}
          <div className="reveal lg:col-span-5">
            <div className="border-t border-line pt-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-body font-medium text-subtle">
                  {pricing.pro.name}
                </h3>
                <StatusLabel status="planned" />
              </div>
              <p className="mt-3 text-small text-subtle">{pricing.pro.status}</p>
              <p className="mt-4 text-small text-subtle">{pricing.pro.price}</p>
              <p className="mt-4 max-w-[46ch] text-body text-muted">
                {pricing.pro.body}
              </p>
            </div>

            <p className="mt-8 max-w-[46ch] border-l-2 border-navy pl-4 text-body font-medium text-ink">
              {pricing.pro.critical}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
