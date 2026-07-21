"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { submitEmployerLead, type EmployerLeadInput } from "@/app/actions";
import { firms } from "@/content/firms";
import { ButtonAction } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ChipMultiField,
  SelectMenu,
  TextAreaField,
  TextField,
} from "@/components/apply/Controls";
import { trackLeadSubmit } from "@/lib/analytics";
import { trackMeta } from "@/lib/meta-pixel";

/*
  Section "Tell us who you need" (#get-matched): the employer page's primary
  conversion. A firm sends its role brief and we come back with a shortlist. Same
  submit architecture as ApplyForm (controlled fields -> submitEmployerLead via
  useTransition, honeypot + timestamp, best-effort confirmation email server
  side). Field config and options come from firms.brief so copy stays data-driven.
*/
const b = firms.brief;

type FormState = {
  full_name: string;
  work_email: string;
  firm_name: string;
  firm_website: string;
  role: string;
  experience_required: string;
  software: string[];
  tax_forms: string[];
  hours_overlap: string;
  budget: string;
  start_timeframe: string;
  details: string;
};

const EMPTY: FormState = {
  full_name: "",
  work_email: "",
  firm_name: "",
  firm_website: "",
  role: "",
  experience_required: "",
  software: [],
  tax_forms: [],
  hours_overlap: "",
  budget: "",
  start_timeframe: "",
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

  const onSubmit = () => {
    setBanner(null);
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
    <section id="get-matched" className="scroll-mt-24 bg-mist py-16 lg:py-28">
      <Container>
        <div className="mx-auto max-w-[760px]">
          {done ? (
            <div className="rounded-card border border-line bg-white p-8 lg:p-10">
              <p className="flex items-center gap-2.5 text-navy">
                <CheckCircle size={26} weight="fill" className="shrink-0" />
                <span className="display display-step">{b.success.heading}</span>
              </p>
              <p className="mt-4 max-w-[52ch] text-body text-muted">
                {b.success.body}
              </p>
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

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="full_name" label={b.fields.full_name.label} required error={errors.full_name}>
                    <TextField
                      id="full_name"
                      value={form.full_name}
                      placeholder={b.fields.full_name.placeholder}
                      invalid={Boolean(errors.full_name)}
                      onChange={(v) => set("full_name", v)}
                    />
                  </Field>

                  <Field id="work_email" label={b.fields.work_email.label} required error={errors.work_email}>
                    <TextField
                      id="work_email"
                      type="email"
                      value={form.work_email}
                      placeholder={b.fields.work_email.placeholder}
                      invalid={Boolean(errors.work_email)}
                      onChange={(v) => set("work_email", v)}
                    />
                  </Field>

                  <Field id="firm_name" label={b.fields.firm_name.label} required error={errors.firm_name}>
                    <TextField
                      id="firm_name"
                      value={form.firm_name}
                      placeholder={b.fields.firm_name.placeholder}
                      invalid={Boolean(errors.firm_name)}
                      onChange={(v) => set("firm_name", v)}
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

                  <Field id="role" label={b.fields.role.label} required error={errors.role}>
                    <SelectMenu
                      id="role"
                      value={form.role}
                      options={b.fields.role.options}
                      invalid={Boolean(errors.role)}
                      onChange={(v) => set("role", v)}
                    />
                  </Field>

                  <Field id="experience_required" label={b.fields.experience_required.label}>
                    <SelectMenu
                      id="experience_required"
                      value={form.experience_required}
                      options={b.fields.experience_required.options}
                      onChange={(v) => set("experience_required", v)}
                    />
                  </Field>

                  <Field id="hours_overlap" label={b.fields.hours_overlap.label}>
                    <SelectMenu
                      id="hours_overlap"
                      value={form.hours_overlap}
                      options={b.fields.hours_overlap.options}
                      onChange={(v) => set("hours_overlap", v)}
                    />
                  </Field>

                  <Field id="budget" label={b.fields.budget.label}>
                    <SelectMenu
                      id="budget"
                      value={form.budget}
                      options={b.fields.budget.options}
                      onChange={(v) => set("budget", v)}
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
                </div>

                <div className="mt-6 grid gap-6">
                  <Field
                    id="software"
                    label={b.fields.software.label}
                    help={b.fields.software.help}
                    group
                  >
                    <ChipMultiField
                      name="software"
                      options={b.fields.software.options}
                      values={form.software}
                      onChange={(v) => set("software", v)}
                    />
                  </Field>

                  <Field
                    id="tax_forms"
                    label={b.fields.tax_forms.label}
                    help={b.fields.tax_forms.help}
                    group
                  >
                    <ChipMultiField
                      name="tax_forms"
                      options={b.fields.tax_forms.options}
                      values={form.tax_forms}
                      onChange={(v) => set("tax_forms", v)}
                    />
                  </Field>

                  <Field
                    id="details"
                    label={b.fields.details.label}
                    help={b.fields.details.help}
                  >
                    <TextAreaField
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

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonAction type="submit" disabled={pending} className="w-full sm:w-auto">
                    {pending ? b.submitting : b.submit}
                  </ButtonAction>
                  <p className="text-caption text-subtle">{firms.trustRow}</p>
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
