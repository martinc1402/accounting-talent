"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { confirmation, intro, type Answers } from "@/content/form";
import { validateQuestion, visibleQuestions } from "@/lib/validate";
import { submitApplication } from "@/app/actions";
import { ButtonAction } from "@/components/ui/Button";
import {
  CityField,
  ConsentField,
  MultiField,
  SelectField,
  TextField,
} from "./Controls";

type Utm = { source?: string; medium?: string; campaign?: string };
type Phase = "intro" | "questions" | "done";

export function ApplyForm({ utm }: { utm: Utm }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Anti-spam: the honeypot input a person never fills, and the time the form
  // became ready. Read at submit and handed to the server, which silently drops
  // a filled honeypot or a sub-2.5s submission. See lib/antispam.ts.
  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef(Date.now());

  // Move focus to each new question so keyboard and screen-reader users are
  // carried along with the form instead of being left where the tapped control
  // just unmounted. preventScroll because the wizard already scrolls to top.
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Recomputed from the answers, so conditional questions (Q8a, the referrer
  // follow-up) appear and disappear as the parent answer changes.
  const steps = useMemo(() => visibleQuestions(answers), [answers]);
  const index = Math.min(step, steps.length - 1);
  const question = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (phase === "questions") {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [index, phase]);

  const set = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const submit = (final: Answers) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitApplication(final, utm, {
        hp: honeypot.current?.value,
        startedAt: startedAt.current,
      });
      if (result.status === "success") {
        setPhase("done");
        window.scrollTo({ top: 0 });
      } else {
        setSubmitError(
          result.message ?? "Something went wrong. Please try again.",
        );
      }
    });
  };

  const advance = (nextAnswers: Answers = answers) => {
    const q = steps[index];
    const message = validateQuestion(q, nextAnswers);
    if (message) {
      setError(message);
      return;
    }

    const nextSteps = visibleQuestions(nextAnswers);
    const nextIndex = nextSteps.findIndex((s) => s.id === q.id) + 1;

    if (nextIndex >= nextSteps.length) {
      submit(nextAnswers);
      return;
    }

    setStep(nextIndex);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* A single tap on a radio option both answers and advances. Without this,
     19 screens would feel like 19 screens. */
  const chooseAndAdvance = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    setError(null);
    window.setTimeout(() => advanceFrom(next, id), 160);
  };

  const advanceFrom = (next: Answers, id: string) => {
    const nextSteps = visibleQuestions(next);
    const at = nextSteps.findIndex((s) => s.id === id);
    if (at + 1 >= nextSteps.length) {
      submit(next);
      return;
    }
    setStep(at + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (phase === "intro") {
    return (
      <div className="rounded-card border border-line bg-white p-7 lg:p-9">
        <ul className="grid gap-4">
          {intro.reassurance.map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-navy"
              />
              <span className="text-body text-muted">
                {line}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-7 border-t border-line pt-6 text-small text-subtle">
          {intro.transition}
        </p>

        <ButtonAction
          className="mt-7 w-full sm:w-auto"
          onClick={() => setPhase("questions")}
        >
          {intro.start}
        </ButtonAction>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="rounded-card border border-line bg-white p-7 lg:p-10">
        <h2 className="display display-figure text-navy">
          {confirmation.h2}
        </h2>
        <p className="mt-5 text-lede font-medium text-ink">
          {confirmation.lede}
        </p>
        <p className="mt-4 max-w-[58ch] text-body text-muted">
          {confirmation.body}
        </p>
      </div>
    );
  }

  const value = answers[question.id];
  const textValue = typeof value === "string" ? value : "";
  const listValue = Array.isArray(value) ? value : [];
  const progress = ((index + 1) / steps.length) * 100;

  return (
    <div>
      {/* Honeypot. Off-screen and aria-hidden, so a person never sees or fills
          it; a form-filling bot usually does, and the server drops the submit.
          data-*-ignore + autoComplete="off" stop a password manager from
          autofilling it and dropping a real applicant. */}
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

      {/* Progress rail. Answering is the only thing that moves it. */}
      <div className="mb-8">
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-navy transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-caption text-subtle">
          Question {index + 1} of {steps.length}
        </p>
      </div>

      <div className="rounded-card border border-line bg-white p-6 lg:p-9">
        <h2
          id={`${question.id}-label`}
          ref={headingRef}
          tabIndex={-1}
          className="display display-step text-ink focus:outline-none"
        >
          {question.label}
          {question.optional && (
            <span className="ml-2 align-middle text-caption font-normal tracking-normal text-subtle">
              Optional
            </span>
          )}
        </h2>

        {question.help && (
          <p className="mt-3 max-w-[54ch] text-small text-subtle">
            {question.help}
          </p>
        )}

        <div className="mt-7">
          {(question.type === "text" ||
            question.type === "email" ||
            question.type === "tel" ||
            question.type === "url") && (
            <TextField
              id={question.id}
              type={question.type}
              value={textValue}
              placeholder={question.placeholder}
              invalid={Boolean(error)}
              onChange={(v) => set(question.id, v)}
              onEnter={() => advance({ ...answers, [question.id]: textValue })}
            />
          )}

          {question.type === "city" && (
            <CityField
              id={question.id}
              value={textValue}
              placeholder={question.placeholder}
              invalid={Boolean(error)}
              onChange={(v) => set(question.id, v)}
            />
          )}

          {question.type === "select" && (
            <SelectField
              name={question.id}
              options={question.options ?? []}
              value={textValue}
              onChange={(v) => chooseAndAdvance(question.id, v)}
            />
          )}

          {(question.type === "multiselect" ||
            question.type === "checkgate") && (
            <MultiField
              name={question.id}
              options={question.options ?? []}
              values={listValue}
              onChange={(v) => set(question.id, v)}
            />
          )}

          {question.type === "consent" && (
            <ConsentField
              name={question.id}
              statement={question.options?.[0] ?? ""}
              checked={listValue.length > 0}
              onChange={(checked) =>
                set(question.id, checked ? [question.options?.[0] ?? "yes"] : [])
              }
            />
          )}
        </div>

        {error && (
          <p
            id={`${question.id}-error`}
            role="alert"
            className="mt-4 flex items-start gap-2 text-small text-red-800"
          >
            <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {submitError && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-card bg-red-50 p-4 text-small text-red-800"
          >
            <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
            {submitError}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          {index > 0 && (
            <button
              type="button"
              onClick={back}
              disabled={pending}
              aria-label="Previous question"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line text-navy transition-colors hover:bg-mist disabled:opacity-40"
            >
              <ArrowLeft size={18} weight="light" />
            </button>
          )}

          {/* Single-selects advance on tap, so they need no button of their own. */}
          {question.type !== "select" && (
            <ButtonAction
              className="flex-1 sm:flex-none"
              disabled={pending}
              onClick={() => advance()}
            >
              {pending ? (
                "Submitting..."
              ) : isLast ? (
                "Submit application"
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} weight="light" className="ml-2" />
                </>
              )}
            </ButtonAction>
          )}
        </div>
      </div>
    </div>
  );
}
