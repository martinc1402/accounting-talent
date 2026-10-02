"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import {
  reserveMembership,
  type MembershipReservationInput,
} from "@/app/actions";
import {
  getAccess,
  pricing,
  targetOptions,
  roleTypeOptions,
  experienceOptions,
  membershipPlans,
  type MembershipPlanId,
} from "@/content/jobs";
import { ButtonAction } from "@/components/ui/Button";
import { Field } from "@/components/apply/Field";
import { ChipMultiField, SelectMenu, TextField } from "@/components/apply/Controls";
import { CurrencyToggle, PlanGrid, plansFor } from "@/components/jobs/PlanGrid";
import { useCurrency, usePlanParam } from "@/components/jobs/currency";
import { formatPrice } from "@/components/jobs/format";
import { trackMembershipReserved } from "@/lib/analytics";

/*
  /get-access: plan cards and the reservation form, sharing one currency and one
  plan choice. Same submit architecture as EmployerBrief (controlled fields ->
  server action via useTransition, honeypot + timestamp, best-effort confirmation
  email server side), writing to membership_reservations.

  The plan arrives from a homepage pricing button as ?plan=, read on the client
  (usePlanParam) so this route stays static. Choosing a card here overrides it.

  Plans are sold per currency (no quarterly in USD). If the chosen plan is not
  sold in the currency now showing, the choice reads as empty rather than being
  silently mapped to a different plan at a different price.

  TODO(payments): add Razorpay (INR: UPI + cards) / Stripe (USD) checkout. Until
  then nothing on this page takes payment, and the copy says so.
*/
type PlanChoice = MembershipPlanId | "unsure" | "";

type FormState = {
  full_name: string;
  email: string;
  whatsapp: string;
  targets: string[];
  role_type: string;
  experience: string;
};

const EMPTY: FormState = {
  full_name: "",
  email: "",
  whatsapp: "",
  targets: [],
  role_type: "",
  experience: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const f = getAccess.fields;

export function ReserveMembership() {
  const [currency, setCurrency] = useCurrency();
  const planFromUrl = usePlanParam();
  const [chosenPlan, setChosenPlan] = useState<PlanChoice | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number | null>(null);
  const utm = useRef<{ source?: string; medium?: string; campaign?: string }>({});
  useEffect(() => {
    startedAt.current = Date.now();
    const p = new URLSearchParams(window.location.search);
    utm.current = {
      source: p.get("utm_source") ?? undefined,
      medium: p.get("utm_medium") ?? undefined,
      campaign: p.get("utm_campaign") ?? undefined,
    };
  }, []);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const choosePlan = (id: PlanChoice) => {
    setChosenPlan(id);
    clearError("plan");
  };

  const available = plansFor(currency);
  const rawPlan: PlanChoice = chosenPlan ?? planFromUrl;
  const plan: PlanChoice =
    rawPlan === "unsure" || available.some((p) => p.id === rawPlan) ? rawPlan : "";

  // The select shows labels; these map label <-> id for the current currency.
  const planLabel = (id: MembershipPlanId) => {
    const p = membershipPlans.find((x) => x.id === id)!;
    return `${p.name}, ${formatPrice(p.price[currency]!, currency)} ${p.unit}`;
  };
  const planOptions = [...available.map((p) => planLabel(p.id)), f.plan.notSure];
  const planValue = plan === "unsure" ? f.plan.notSure : plan ? planLabel(plan) : "";
  const onPlanSelect = (label: string) => {
    if (label === f.plan.notSure) return choosePlan("unsure");
    const match = available.find((p) => planLabel(p.id) === label);
    choosePlan(match ? match.id : "");
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  // Conversion analytics from the success render only, so a failed submit never
  // counts.
  const fired = useRef(false);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      trackMembershipReserved(plan || "unsure", currency);
    }
  }, [done, plan, currency]);

  const onSubmit = () => {
    setBanner(null);

    const local: Record<string, string> = {};
    if (!form.full_name.trim()) local.full_name = "Please tell us your name.";
    if (!EMAIL_RE.test(form.email.trim())) local.email = "Please enter a valid email address.";
    if (form.targets.length === 0) local.targets = "Please pick at least one place you want to work.";
    if (!form.role_type) local.role_type = "Please choose your main role type.";
    if (!form.experience) local.experience = "Please choose your experience.";
    if (!plan) local.plan = "Please choose a plan, or \"Not sure yet\".";
    if (Object.keys(local).length > 0) {
      setErrors(local);
      setBanner("A few details need fixing before we can save this.");
      document.getElementById(Object.keys(local)[0]!)?.focus();
      return;
    }

    const payload: MembershipReservationInput = { ...form, plan, currency };
    startTransition(async () => {
      const result = await reserveMembership(payload, utm.current, {
        hp: honeypot.current?.value,
        startedAt: startedAt.current ?? undefined,
      });
      if (result.status === "success") {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(result.errors ?? {});
        setBanner(result.message ?? getAccess.genericError);
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-card border border-line bg-white p-8 lg:p-10">
        <p className="flex items-start gap-2.5 text-navy">
          <CheckCircle size={26} weight="fill" className="mt-1 shrink-0" aria-hidden />
          <span className="display display-step">{getAccess.success.heading}</span>
        </p>
        {getAccess.success.body.map((para) => (
          <p key={para} className="mt-4 max-w-[54ch] text-body text-muted">
            {para}
          </p>
        ))}
      </div>
    );
  }

  return (
    <>
      <section aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="display display-step text-ink">
          {getAccess.plansHeading}
        </h2>
        <div className="mt-6">
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
        <div className="mt-6">
          <PlanGrid
            currency={currency}
            selectedId={plan || undefined}
            renderCta={(p, flagged) => {
              const selected = p.id === plan;
              return (
                <ButtonAction
                  type="button"
                  variant={selected || flagged ? "primary" : "outline"}
                  aria-pressed={selected}
                  className="w-full"
                  onClick={() => {
                    choosePlan(p.id);
                    document
                      .getElementById("reserve-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {selected ? `${p.name} selected` : `Choose ${p.name.toLowerCase()}`}
                </ButtonAction>
              );
            }}
          />
        </div>
        <p className="mt-5 max-w-[70ch] text-caption text-subtle">
          {pricing.payment[currency]}
        </p>
      </section>

      <section id="reserve-form" aria-labelledby="form-heading" className="mt-14 scroll-mt-24 lg:mt-20">
        <h2 id="form-heading" className="display display-step text-ink">
          {getAccess.formHeading}
        </h2>
        <p className="mt-3 max-w-[56ch] text-body text-muted">{getAccess.formSub}</p>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="relative mt-6 rounded-card border border-line bg-white p-5 sm:p-8 lg:p-9"
        >
          {/* Honeypot: off-screen, aria-hidden. Filled only by bots. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label>
              Company website
              <input
                ref={honeypot}
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="full_name" label={f.full_name.label} required error={errors.full_name}>
              <TextField
                id="full_name"
                value={form.full_name}
                placeholder={f.full_name.placeholder}
                invalid={Boolean(errors.full_name)}
                onChange={(v) => set("full_name", v)}
              />
            </Field>

            <Field id="email" label={f.email.label} help={f.email.help} required error={errors.email}>
              <TextField
                id="email"
                type="email"
                value={form.email}
                placeholder={f.email.placeholder}
                invalid={Boolean(errors.email)}
                onChange={(v) => set("email", v)}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field id="whatsapp" label={f.whatsapp.label} help={f.whatsapp.help} error={errors.whatsapp}>
                <TextField
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  placeholder={f.whatsapp.placeholder}
                  invalid={Boolean(errors.whatsapp)}
                  onChange={(v) => set("whatsapp", v)}
                />
              </Field>
            </div>
          </div>

          <div className="mt-6">
            <Field id="targets" label={f.targets.label} help={f.targets.help} required error={errors.targets} group>
              <ChipMultiField
                name="targets"
                options={targetOptions}
                values={form.targets}
                onChange={(v) => set("targets", v)}
              />
            </Field>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id="role_type" label={f.role_type.label} required error={errors.role_type}>
              <SelectMenu
                id="role_type"
                value={form.role_type}
                options={roleTypeOptions}
                invalid={Boolean(errors.role_type)}
                onChange={(v) => set("role_type", v)}
              />
            </Field>

            <Field id="experience" label={f.experience.label} required error={errors.experience}>
              <SelectMenu
                id="experience"
                value={form.experience}
                options={experienceOptions}
                invalid={Boolean(errors.experience)}
                onChange={(v) => set("experience", v)}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field id="plan" label={f.plan.label} required error={errors.plan}>
                <SelectMenu
                  id="plan"
                  value={planValue}
                  options={planOptions}
                  invalid={Boolean(errors.plan)}
                  onChange={onPlanSelect}
                />
              </Field>
            </div>
          </div>

          {banner && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-card bg-red-50 p-4 text-small text-red-800"
            >
              <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" aria-hidden />
              {banner}
            </p>
          )}

          <div className="mt-8">
            <ButtonAction type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? getAccess.submitting : getAccess.submit}
            </ButtonAction>
            <p className="mt-4 max-w-[56ch] text-caption text-subtle">{getAccess.reassurance}</p>
          </div>

          <p className="mt-4 text-fine text-subtle">{getAccess.requiredNote}</p>
        </form>
      </section>
    </>
  );
}
