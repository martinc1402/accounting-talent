"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { submitEmployerLead, type EmployerLeadInput } from "@/app/actions";
import { firms } from "@/content/firms";
import { isFreeEmailProvider } from "@/lib/email/freeProviders";
import { ButtonAction } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ChipMultiField,
  SelectMenu,
  TextField,
} from "@/components/apply/Controls";
import { trackLeadSubmit } from "@/lib/analytics";
import { trackMeta } from "@/lib/meta-pixel";

/*
  "Reserve founding access" (#reserve): the homepage's primary conversion and the
  only thing this smoke test actually measures. Same submit architecture as
  ApplyForm (controlled fields -> submitEmployerLead via useTransition, honeypot +
  timestamp, best-effort confirmation email server side). Field config and options
  come from firms.brief so copy stays data-driven.

  Eight questions, down from twelve. The concierge version asked what a matcher
  needed to build a shortlist this week (software, tax forms, hour overlap); this
  one asks what tells us whether a firm is worth building the pool toward, which
  is a different and shorter list. Every field removed is a field a firm owner
  does not abandon the form on.

  Work email is the one field with client-side validation, because it is the one
  that can be wrong in a way the person did not intend. Everything else is a
  select. The server re-checks it regardless (app/actions.ts): this is feedback,
  not enforcement, and the form keeps noValidate so the browser never competes
  with our own messages.
*/
const b = firms.brief;

// Same deliberately loose shape as the signin gate in app/login/LoginForm.tsx.
// It only rejects what could not possibly be an address; anything stricter starts
// rejecting real ones, and the server is the authority either way.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FormState = {
  firm_name: string;
  full_name: string;
  work_email: string;
  firm_website: string;
  firm_size: string;
  roles: string[];
  hires_12mo: string;
  start_timeframe: string;
  budget: string;
  details: string;
};

const EMPTY: FormState = {
  firm_name: "",
  full_name: "",
  work_email: "",
  firm_website: "",
  firm_size: "",
  roles: [],
  hires_12mo: "",
  start_timeframe: "",
  budget: "",
  details: "",
};

export function EmployerBrief() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // Anti-spam (see lib/antispam.ts): the honeypot a person never fills and the
  // time the form became ready. Stamped in an effect rather than at render, both
  // to keep render pure and because Date.now() during render would mismatch the
  // server's first paint (the same reason FoundingForm stamps its ts in an effect).
  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number | null>(null);

  // UTM captured client-side from the URL, so the page can stay statically
  // rendered (no searchParams dependency). Read once on mount.
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

  // Fire conversion analytics once, from the success render, never on the click
  // (so a failed submit never counts).
  const leadFired = useRef(false);
  useEffect(() => {
    if (done && !leadFired.current) {
      leadFired.current = true;
      trackLeadSubmit();
      trackMeta("Lead");
    }
  }, [done]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /*
    The one client-side check. It mirrors the server rule in submitEmployerLead
    so a firm owner who types a personal address finds out before the round trip
    rather than after it. The server still decides; if these two ever disagree,
    the server's answer is the one that lands in the field error.
  */
  const localEmailError = (): string | null => {
    const value = form.work_email.trim().toLowerCase();
    if (!value) return "Please enter your work email address.";
    if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
    if (isFreeEmailProvider(value)) {
      return "Please use your firm's email address. It's how we confirm the practice before we open access.";
    }
    return null;
  };

  const onSubmit = () => {
    setBanner(null);

    const emailError = localEmailError();
    if (emailError) {
      setErrors((prev) => ({ ...prev, work_email: emailError }));
      document.getElementById("work_email")?.focus();
      return;
    }

    const payload: EmployerLeadInput = { ...form };
    startTransition(async () => {
      const result = await submitEmployerLead(payload, utm.current, {
        hp: honeypot.current?.value,
        startedAt: startedAt.current ?? undefined,
      });
      if (result.status === "success") {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(result.errors ?? {});
        setBanner(result.message ?? b.genericError);
      }
    });
  };

  return (
    <section id="reserve" className="scroll-mt-24 bg-mist py-16 lg:py-28">
      <Container>
        <div className="mx-auto max-w-[760px]">
          {done ? (
            /*
              The confirmation is a real state, not a toast: it replaces the form
              in place and stays there. A firm that just handed over its hiring
              plans should get a page that answers "what did I just do", and a
              banner that fades in three seconds answers nothing.

              Four things, in the order they get asked: thanks and the rate is
              held, the timeline, that nothing is owed and nothing is committed,
              and that the confirmation email is a live reply address rather than
              a no-reply. Copy is in firms.brief.success.
            */
            <div className="rounded-card border border-line bg-white p-8 lg:p-10">
              <p className="flex items-start gap-2.5 text-navy">
                <CheckCircle
                  size={26}
                  weight="fill"
                  className="mt-1 shrink-0"
                />
                <span className="display display-step">{b.success.heading}</span>
              </p>

              <p className="mt-5 max-w-[54ch] text-lede text-ink">
                {b.success.lede}
              </p>

              {b.success.body.map((para) => (
                <p key={para} className="mt-4 max-w-[54ch] text-body text-muted">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <>
              <SectionHeading>{b.heading}</SectionHeading>
              <p className="mt-4 max-w-[54ch] text-body text-muted">{b.sub}</p>

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
                className="mt-8 rounded-card border border-line bg-white p-6 sm:p-8 lg:p-9"
              >
                {/* Honeypot: off-screen, aria-hidden, ignored by password
                    managers. Filled only by bots; the server drops those. */}
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

                {/*
                  Qualifying questions first, in this order: firm, email, size,
                  volume, timing, budget. Someone who abandons halfway has still
                  told us what this smoke test exists to learn. Contact name and
                  website come after them, then roles and the open box.

                  Six qualifying fields in a plain two-column grid, all the same
                  size. Timing and budget used to span the full width; budget was
                  widened to mark it as the field that matters, and timing had to
                  follow to avoid stranding an empty cell beside it. Uniform is
                  better: three clean rows, no empty cells, and budget carries the
                  same weight as everything else in the block rather than reading
                  as an upsell. Its position is what marks it, not its size.

                  Single column below sm. Every control in Controls.tsx already
                  clears a 52px tap target, so the phone layout is this grid
                  collapsing rather than a separate treatment.
                */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="firm_name" label={b.fields.firm_name.label} required error={errors.firm_name}>
                    <TextField
                      id="firm_name"
                      value={form.firm_name}
                      placeholder={b.fields.firm_name.placeholder}
                      invalid={Boolean(errors.firm_name)}
                      onChange={(v) => set("firm_name", v)}
                    />
                  </Field>

                  <Field
                    id="work_email"
                    label={b.fields.work_email.label}
                    help={b.fields.work_email.help}
                    required
                    error={errors.work_email}
                  >
                    <TextField
                      id="work_email"
                      type="email"
                      value={form.work_email}
                      placeholder={b.fields.work_email.placeholder}
                      invalid={Boolean(errors.work_email)}
                      onChange={(v) => set("work_email", v)}
                    />
                  </Field>

                  <Field id="firm_size" label={b.fields.firm_size.label} required error={errors.firm_size}>
                    <SelectMenu
                      id="firm_size"
                      value={form.firm_size}
                      options={b.fields.firm_size.options}
                      invalid={Boolean(errors.firm_size)}
                      onChange={(v) => set("firm_size", v)}
                    />
                  </Field>

                  <Field id="hires_12mo" label={b.fields.hires_12mo.label}>
                    <SelectMenu
                      id="hires_12mo"
                      value={form.hires_12mo}
                      options={b.fields.hires_12mo.options}
                      onChange={(v) => set("hires_12mo", v)}
                    />
                  </Field>

                  <Field id="start_timeframe" label={b.fields.start_timeframe.label}>
                    <SelectMenu
                      id="start_timeframe"
                      value={form.start_timeframe}
                      options={b.fields.start_timeframe.options}
                      onChange={(v) => set("start_timeframe", v)}
                    />
                  </Field>

                  <Field
                    id="budget"
                    label={b.fields.budget.label}
                    help={b.fields.budget.help}
                  >
                    <SelectMenu
                      id="budget"
                      value={form.budget}
                      options={b.fields.budget.options}
                      onChange={(v) => set("budget", v)}
                    />
                  </Field>

                  <Field id="full_name" label={b.fields.full_name.label} required error={errors.full_name}>
                    <TextField
                      id="full_name"
                      value={form.full_name}
                      placeholder={b.fields.full_name.placeholder}
                      invalid={Boolean(errors.full_name)}
                      onChange={(v) => set("full_name", v)}
                    />
                  </Field>

                  <Field id="firm_website" label={b.fields.firm_website.label} error={errors.firm_website}>
                    <TextField
                      id="firm_website"
                      type="url"
                      value={form.firm_website}
                      placeholder={b.fields.firm_website.placeholder}
                      invalid={Boolean(errors.firm_website)}
                      onChange={(v) => set("firm_website", v)}
                    />
                  </Field>
                </div>

                <div className="mt-6 grid gap-6">
                  <Field
                    id="roles"
                    label={b.fields.roles.label}
                    help={b.fields.roles.help}
                    error={errors.roles}
                    group
                  >
                    <ChipMultiField
                      name="roles"
                      options={b.fields.roles.options}
                      values={form.roles}
                      onChange={(v) => set("roles", v)}
                    />
                  </Field>

                  <Field
                    id="details"
                    label={b.fields.details.label}
                    help={b.fields.details.help}
                  >
                    <TextField
                      id="details"
                      value={form.details}
                      placeholder={b.fields.details.placeholder}
                      onChange={(v) => set("details", v)}
                    />
                  </Field>
                </div>

                {banner && (
                  <p
                    role="alert"
                    className="mt-6 flex items-start gap-2 rounded-card bg-red-50 p-4 text-small text-red-800"
                  >
                    <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
                    {banner}
                  </p>
                )}

                <div className="mt-8">
                  <ButtonAction type="submit" disabled={pending} className="w-full sm:w-auto">
                    {pending ? b.submitting : b.submit}
                  </ButtonAction>

                  {/* Directly under the button, because that is where the
                      hesitation happens. It answers when they hear back, what it
                      costs now, and what they are committing to. It replaced
                      firms.trustRow here: that line ("no monthly markup, no
                      exclusivity") argues the product, which is the wrong job at
                      the moment somebody's cursor is over Submit. TrustRow still
                      carries it under the hero and closing CTAs. */}
                  <p className="mt-4 max-w-[56ch] text-caption text-subtle">
                    {b.reassurance}
                  </p>
                </div>

                <p className="mt-4 text-fine text-subtle">{b.requiredNote}</p>
              </form>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}

/* Label + optional helper + error, shared by every field. `group` renders the
   label as a span with the id the chip groups reference via aria-labelledby;
   otherwise it is a real <label htmlFor>. */
function Field({
  id,
  label,
  required = false,
  help,
  error,
  group = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  group?: boolean;
  children: ReactNode;
}) {
  const labelContent = (
    <>
      {label}
      {required && (
        <span className="text-navy" aria-hidden>
          {" "}
          *
        </span>
      )}
    </>
  );

  return (
    <div>
      {group ? (
        <span id={`${id}-label`} className="block text-caption font-medium text-ink">
          {labelContent}
        </span>
      ) : (
        <label htmlFor={id} className="block text-caption font-medium text-ink">
          {labelContent}
        </label>
      )}
      {help && <p className="mt-1 text-fine text-subtle">{help}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-small text-red-800"
        >
          <WarningCircle size={16} weight="light" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
