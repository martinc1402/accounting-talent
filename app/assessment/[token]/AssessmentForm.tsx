"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { ButtonAction } from "@/components/ui/Button";
import {
  assessment,
  WRITING_MAX,
  WRITING_MIN,
  WRITING_TARGET_MAX,
  WRITING_TARGET_MIN,
} from "@/content/assessment";

// Local shape, matching lib/assessment/questions.ts getPublicQuestions(). Kept
// here rather than imported so nothing pulls the server-only module into the
// client bundle.
type Question = {
  id: string;
  prompt: string;
  options: { value: string; text: string }[];
};

const fieldBase =
  "w-full rounded-card border bg-white px-4 py-3.5 text-body text-ink placeholder:text-subtle/70 transition-colors focus:border-navy focus:outline-none";

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function AssessmentForm({
  token,
  questions,
}: {
  token: string;
  questions: Question[];
}) {
  const storageKey = `assessment:${token}`;

  const [writing, setWriting] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef(Date.now());
  const restored = useRef(false);

  // Restore an in-progress attempt so an accidental refresh doesn't wipe 25
  // minutes of work. Runs once, before the first save effect can overwrite it.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          writing?: string;
          answers?: Record<string, string>;
        };
        if (typeof saved.writing === "string") setWriting(saved.writing);
        if (saved.answers) setAnswers(saved.answers);
      }
    } catch {
      // ignore corrupt storage
    }
    restored.current = true;
  }, [storageKey]);

  // Autosave after the restore has run.
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ writing, answers }));
    } catch {
      // storage full / disabled — non-fatal, the form still works
    }
  }, [writing, answers, storageKey]);

  const words = useMemo(() => countWords(writing), [writing]);
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const belowFloor = words < WRITING_MIN;
  const aboveCeiling = words > WRITING_MAX;
  const onTarget = words >= WRITING_TARGET_MIN && words <= WRITING_TARGET_MAX;
  const allAnswered = answeredCount === questions.length;
  const canSubmit = !belowFloor && !aboveCeiling && allAnswered && !submitting;

  const wordCountClass = onTarget
    ? "text-navy font-medium"
    : "text-subtle";

  async function submit() {
    setError(null);
    if (belowFloor) {
      setError(`Please write at least ${WRITING_MIN} words.`);
      return;
    }
    if (!allAnswered) {
      setError("Please answer all 10 questions.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assessment/${token}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          writing_sample: writing,
          answers,
          hp: honeypot.current?.value ?? "",
          startedAt: startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
        setDone(true);
        window.scrollTo({ top: 0 });
        return;
      }
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-line bg-white p-7 lg:p-10">
        <h1 className="display display-figure text-navy">
          {assessment.confirmation.heading}
        </h1>
        <p className="mt-4 max-w-[54ch] text-body text-muted">
          {assessment.confirmation.body}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Honeypot — off-screen, ignored by password managers, never seen. */}
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

      <h1 className="display display-page text-ink">{assessment.header}</h1>
      {assessment.intro.map((line) => (
        <p key={line} className="mt-5 max-w-[60ch] text-body text-muted">
          {line}
        </p>
      ))}

      {/* Section 1 — writing prompt */}
      <section className="mt-10 rounded-card border border-line bg-white p-6 lg:p-9">
        <h2 className="display display-step text-ink">
          {assessment.writing.heading}
        </h2>
        <p className="mt-3 max-w-[60ch] text-body text-muted">
          {assessment.writing.body}
        </p>
        <p className="mt-3 max-w-[60ch] text-small font-medium text-ink">
          {assessment.writing.lengthNote}
        </p>

        <div className="mt-4 rounded-card bg-mist p-4">
          <p className="text-small font-medium text-ink">
            {assessment.writing.thingsToKnowLabel}
          </p>
          <ol className="mt-2 grid gap-2">
            {assessment.writing.thingsToKnow.map((t, i) => (
              <li key={t} className="flex gap-2 text-small text-muted">
                <span className="shrink-0 font-medium text-navy">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <textarea
          value={writing}
          onChange={(e) => setWriting(e.target.value)}
          placeholder={assessment.writing.placeholder}
          rows={9}
          aria-label="Your written answer"
          className={`${fieldBase} mt-5 min-h-[220px] resize-y leading-relaxed`}
        />

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className={`text-caption ${wordCountClass}`}>
            {words} {words === 1 ? "word" : "words"}
          </p>
          {belowFloor && words > 0 && (
            <p className="text-caption text-subtle">
              At least {WRITING_MIN} words to submit.
            </p>
          )}
          {aboveCeiling && (
            <p className="text-caption text-red-800">
              Please keep it under {WRITING_MAX} words.
            </p>
          )}
        </div>
      </section>

      {/* Section 2 — quiz */}
      <section className="mt-8 rounded-card border border-line bg-white p-6 lg:p-9">
        <h2 className="display display-step text-ink">
          {assessment.quiz.heading}
        </h2>
        <p className="mt-3 max-w-[60ch] text-small text-subtle">
          {assessment.quiz.intro}
        </p>

        <ol className="mt-6 grid gap-8">
          {questions.map((q, i) => (
            <li key={q.id}>
              <fieldset>
                <legend className="text-body font-medium text-ink">
                  <span className="text-navy">{i + 1}.</span> {q.prompt}
                </legend>
                <div
                  role="radiogroup"
                  aria-label={`Question ${i + 1}`}
                  className="mt-3 grid gap-2.5"
                >
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                        }
                        className={`flex w-full items-center gap-3 rounded-card border px-4 py-3.5 text-left text-body transition-all active:translate-y-px ${
                          selected
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-ink hover:border-navy/40 hover:bg-mist"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-white bg-white" : "border-line"
                          }`}
                        >
                          {selected && (
                            <span className="size-2 rounded-full bg-navy" />
                          )}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-card bg-red-50 p-4 text-small text-red-800"
        >
          <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonAction
          className="w-full sm:w-auto"
          disabled={!canSubmit}
          onClick={submit}
        >
          {submitting ? "Submitting…" : assessment.submit}
        </ButtonAction>
        <p className="text-caption text-subtle">
          {answeredCount} of {questions.length} answered
        </p>
      </div>
    </div>
  );
}
