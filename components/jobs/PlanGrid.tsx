import type { ReactNode } from "react";
import type { Currency, MembershipPlan } from "@/content/jobs";
import { membershipPlans, pricing } from "@/content/jobs";
import { formatPrice } from "@/components/jobs/format";

/*
  The membership plan cards, shared by the homepage pricing and /get-access. No
  hooks: the caller owns the currency and decides what each card's button does
  (a link to /get-access on "/", a "choose this plan" button on /get-access).

  Same visual vocabulary as components/marketing/PricingCard on /employers: white
  card with a hairline, the flagged plan in mist with a navy border and pill, no
  shadow or scale. A floating card would read as a different site.

  Compact on purpose. Four plans stack on a phone, so each card carries only
  name, price, unit and one line; what every plan includes is said once below the
  grid rather than four times inside it.
*/
export function plansFor(currency: Currency): MembershipPlan[] {
  return membershipPlans.filter((p) => p.price[currency] !== undefined);
}

export function PlanGrid({
  currency,
  selectedId,
  renderCta,
}: {
  currency: Currency;
  selectedId?: string;
  renderCta: (plan: MembershipPlan, flagged: boolean) => ReactNode;
}) {
  const plans = plansFor(currency);
  const cols = plans.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
      {plans.map((plan) => {
        const amount = plan.price[currency]!;
        const flagged = Boolean(plan.flag);
        const selected = plan.id === selectedId;
        const perMonth =
          plan.months > 1
            ? formatPrice(Math.round(amount / plan.months), currency)
            : null;

        return (
          <li
            key={plan.id}
            className={`flex h-full flex-col rounded-card border p-6 lg:p-7 ${
              flagged ? "border-navy bg-mist" : "border-line bg-white"
            } ${selected ? "outline-2 outline-offset-2 outline-navy" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-body font-medium text-navy">{plan.name}</h3>
              {plan.flag && (
                <span className="inline-flex items-center rounded-full bg-navy px-2.5 py-1 text-fine font-medium tracking-wide text-white uppercase">
                  {plan.flag}
                </span>
              )}
            </div>

            <p className="display display-figure mt-3 text-ink">
              {formatPrice(amount, currency)}
            </p>
            <p className="mt-1 text-caption text-subtle">
              {plan.unit}
              {perMonth && <> · about {perMonth} a month</>}
            </p>
            <p className="mt-3 text-small text-muted">{plan.note}</p>

            {/* mt-auto pins every button to the same baseline. */}
            <div className="mt-auto pt-6">{renderCta(plan, flagged)}</div>
          </li>
        );
      })}
    </ul>
  );
}

export function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  const options: { value: Currency; label: string; name: string }[] = [
    { value: "INR", label: "₹ INR", name: "Indian rupees" },
    { value: "USD", label: "$ USD", name: "US dollars" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span id="currency-label" className="text-caption text-subtle">
        {pricing.currencyLabel}
      </span>
      {/* Two toggle buttons with aria-pressed rather than a radiogroup: a
          role="radio" pair owes arrow-key handling, and two plain buttons
          are fully keyboard-usable as they are. */}
      <div
        role="group"
        aria-labelledby="currency-label"
        className="inline-flex rounded-full border border-navy/25 bg-white p-1"
      >
        {options.map((o) => {
          const active = o.value === currency;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              aria-label={o.name}
              onClick={() => onChange(o.value)}
              className={`min-h-[40px] rounded-full px-4 text-small font-medium transition-colors ${
                active ? "bg-navy text-white" : "text-navy hover:bg-mist"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
