import { Check } from "@phosphor-icons/react/dist/ssr";
import type { Plan } from "@/content/passport";
import { StatusLabel } from "@/components/marketing/StatusLabel";
import { PlanCta } from "@/components/marketing/PlanCta";

/*
  One plan.

  This DOES reverse a recorded decision, and says so rather than pretending the
  old reasoning never existed. The previous Pricing section laid out 2 + 1 and its
  comment argued: "Three equal columns would have read as a pricing table for
  three plans, which is the wrong idea entirely." That was correct for the old
  model, which was one access fee plus one success fee: two numbers a firm pays,
  not three products to choose between. The model is now genuinely three products
  at three prices, and a firm choosing between them needs them side by side. The
  old objection does not apply to the new offer.

  Each `includes` line carries its own status, because a plan is a bundle of
  capabilities and most of the interesting ones are not built. A Hiring Pass that
  silently listed "Direct messaging" alongside working features would be the exact
  misrepresentation this rewrite exists to avoid, so unbuilt lines are marked
  individually rather than the whole card carrying one vague caveat.

  The flagged plan gets a navy border and a pill, not a scale transform or a
  shadow. On a page whose only elevated surface is a profile card, a floating
  pricing column would read as a different site.
*/
export function PricingCard({ plan }: { plan: Plan }) {
  const flagged = Boolean(plan.flag);

  return (
    <div
      className={`reveal flex h-full flex-col rounded-card border p-7 lg:p-8 ${
        flagged ? "border-navy bg-mist" : "border-line bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="text-body font-medium text-navy">{plan.name}</h3>
        {plan.flag && (
          <span className="inline-flex items-center rounded-full bg-navy px-2.5 py-1 text-fine font-medium tracking-wide text-white uppercase">
            {plan.flag}
          </span>
        )}
      </div>

      <p className="display display-figure mt-3 text-ink">{plan.price}</p>
      <p className="mt-1 text-caption text-subtle">{plan.unit}</p>
      <p className="mt-4 max-w-[40ch] text-body text-muted">{plan.body}</p>

      <ul className="mt-6 space-y-2.5">
        {plan.includes.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2.5">
            <Check
              size={16}
              weight="light"
              aria-hidden
              className="mt-1 shrink-0 text-navy"
            />
            <span className="text-small text-muted">
              {feature.text}
              {feature.status !== "live" && (
                <span className="ml-2 inline-block align-middle">
                  <StatusLabel status={feature.status} />
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {plan.excludes && (
        <ul className="mt-5 space-y-1.5 border-t border-line pt-5">
          {plan.excludes.map((line) => (
            <li key={line} className="text-caption text-subtle">
              {line}
            </li>
          ))}
        </ul>
      )}

      {plan.guarantee && (
        <p className="mt-5 max-w-[40ch] border-t border-line pt-5 text-small text-ink">
          {plan.guarantee}
        </p>
      )}

      {/* mt-auto pins every card's CTA to the same baseline however uneven the
          feature lists are. */}
      <div className="mt-auto pt-7">
        {plan.action.status === "planned" ? (
          <p className="max-w-[40ch] text-small text-subtle">
            {plan.action.note}
          </p>
        ) : (
          <>
            <PlanCta
              plan={plan.id}
              label={plan.action.label}
              href={plan.action.href}
              variant={flagged ? "primary" : "outline"}
            />
            {plan.action.status === "early-access" && (
              <p className="mt-3 max-w-[40ch] text-caption text-subtle">
                {plan.action.note}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
