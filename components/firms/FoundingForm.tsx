"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import {
  joinFirmWaitlist,
  saveFirmConcierge,
  type WaitlistState,
} from "@/app/actions";
import { firms } from "@/content/firms";
import { ButtonAction } from "@/components/ui/Button";
import { SelectField } from "@/components/apply/Controls";

const initial: WaitlistState = { status: "idle" };
const f = firms.founding;

/*
  The founding-firm card interior (Section 2). It owns the whole swap, because
  the spec is to replace the card contents on submit, not just the form: the
  offer + email field give way to the two concierge questions that feed the
  hand-match pipeline. The card shell (#founding, bg-mist) lives in the page.
*/
export function FoundingForm() {
  const [state, formAction, pending] = useActionState(joinFirmWaitlist, initial);

  // Stamped into the hidden `ts` input after mount, via a ref rather than state:
  // Date.now() during render would mismatch the server's empty first paint, and
  // writing the DOM value in an effect avoids a setState-in-effect cascade. The
  // server reads `ts` to reject sub-second (bot) submissions.
  const tsRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);

  if (state.status === "success") {
    // A real success carries the email, so the card swaps to the concierge step.
    // A silent guard-success (bot/throttle) carries no email: show the plain
    // confirmation and stop there.
    return state.email ? (
      <Concierge email={state.email} />
    ) : (
      <Confirmation />
    );
  }

  return (
    <div>
      <p className="text-caption font-medium tracking-wide text-subtle uppercase">
        {f.eyebrow}
      </p>
      <h2 className="mt-2 display display-step text-ink">{f.headline}</h2>
      <p className="mt-3 max-w-[42ch] text-small text-muted">{f.intro}</p>

      <ul className="mt-4 space-y-2.5">
        {f.points.map((point) => (
          <li key={point.title} className="text-small text-muted">
            <span className="font-medium text-navy">{point.title}</span>{" "}
            {point.body}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-small text-navy">{f.scarcity}</p>

      <form action={formAction} noValidate className="mt-6">
        {/*
          Anti-spam, invisible to people. Off-screen (not display:none, so a
          form-filling bot still fills it) and aria-hidden. The data-*-ignore
          attributes keep password managers from autofilling it. `ts` lets the
          server reject sub-second POSTs. Both are read in joinFirmWaitlist.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Company website
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />
          </label>
        </div>
        <input type="hidden" name="ts" ref={tsRef} defaultValue="" />

        <label htmlFor="email" className="block text-caption font-medium text-ink">
          {f.label}
        </label>

        <div className="mt-2 flex flex-col gap-3">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={f.placeholder}
            aria-invalid={state.status === "error" || undefined}
            aria-describedby={state.status === "error" ? "email-error" : undefined}
            className={`w-full rounded-full border bg-white px-5 py-3.5 text-body text-ink placeholder:text-subtle/70 transition-colors focus:border-navy focus:outline-none ${
              state.status === "error"
                ? "border-red-700"
                : "border-line hover:border-navy/40"
            }`}
          />

          <ButtonAction type="submit" disabled={pending} className="w-full">
            {pending ? "Adding you..." : f.cta}
          </ButtonAction>
        </div>

        <p className="mt-3 text-fine text-subtle">{f.microcopy}</p>

        {state.status === "error" && (
          <p
            id="email-error"
            role="alert"
            className="mt-3 flex items-start gap-2 text-small text-red-800"
          >
            <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}

/* The plain confirmation, for the guard paths that never reach the concierge. */
function Confirmation() {
  return (
    <p className="flex items-start gap-3 text-body text-navy">
      <CheckCircle size={20} weight="light" className="mt-0.5 shrink-0" />
      {f.concierge.successHeading} We&apos;ll be in touch before launch with
      founding-firm details.
    </p>
  );
}

/*
  The post-submit concierge. Two single-select questions, each tap persisting
  that one answer (fire-and-forget, so a slow write never blocks the taps). Both
  are optional.

  When the reader answers both, the card transitions in place to a done panel
  after a short beat (so the second selection registers before it collapses),
  which is what makes the step read as finished rather than still waiting. They
  can also finish early: "Done" once at least one answer is given, "Skip" if
  none. No navigation, and the answers have already persisted regardless.
*/
function Concierge({ email }: { email: string }) {
  const c = firms.founding.concierge;
  const [role, setRole] = useState("");
  const [timing, setTiming] = useState("");
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  const save = (patch: { role?: string; timing?: string }) =>
    startTransition(() => {
      void saveFirmConcierge({ email, ...patch });
    });

  const answered = Boolean(role || timing);

  // Auto-advance to the done panel once both are answered. The beat lets the
  // second selection show before the card collapses; editing within it resets
  // the timer (deps change -> cleanup) so a change never transitions early.
  useEffect(() => {
    if (!(role && timing) || done) return;
    const t = setTimeout(() => setDone(true), 600);
    return () => clearTimeout(t);
  }, [role, timing, done]);

  if (done) {
    // Pure skip (nothing answered) gets the plain confirmation; an answered
    // reader gets the tailored message plus an echo of what we captured.
    if (!answered) return <Confirmation />;
    const summary = [
      role && `${c.summaryRoleLabel}: ${role}`,
      timing && `${c.summaryTimingLabel}: ${timing}`,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <div>
        <p className="flex items-center gap-2 text-body font-medium text-navy">
          <CheckCircle size={20} weight="fill" className="shrink-0" />
          {c.successHeading}
        </p>
        <p className="mt-3 max-w-[40ch] text-small text-navy">
          {timing === c.beforeSeasonValue ? c.beforeSeasonClose : c.saved}
        </p>
        <p className="mt-4 text-caption text-subtle">{summary}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="flex items-center gap-2 text-body font-medium text-navy">
        <CheckCircle size={20} weight="fill" className="shrink-0" />
        {c.successHeading}
      </p>
      <p className="mt-3 max-w-[40ch] text-small text-muted">{c.intro}</p>

      <div className="mt-6">
        <p id="role-label" className="text-caption font-medium text-ink">
          {c.roleQ}
        </p>
        <div className="mt-2.5">
          <SelectField
            name="role"
            options={c.roleOptions}
            value={role}
            onChange={(v) => {
              setRole(v);
              save({ role: v });
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        <p id="timing-label" className="text-caption font-medium text-ink">
          {c.timingQ}
        </p>
        <div className="mt-2.5">
          <SelectField
            name="timing"
            options={c.timingOptions}
            value={timing}
            onChange={(v) => {
              setTiming(v);
              save({ timing: v });
            }}
          />
        </div>
      </div>

      {/* Finish early / opt out. Both land on the done panel; answering both
          auto-advances there without needing this. */}
      {answered ? (
        <button
          type="button"
          onClick={() => setDone(true)}
          className="mt-6 text-caption font-medium text-navy hover:text-navy-deep"
        >
          {c.done}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setDone(true)}
          className="mt-6 text-caption text-subtle underline underline-offset-2 hover:text-navy"
        >
          {c.skip}
        </button>
      )}
    </div>
  );
}
