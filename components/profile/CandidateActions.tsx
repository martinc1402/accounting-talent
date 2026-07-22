"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  BookmarkSimple,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { requestIntroduction, type IntroState } from "@/app/actions";

/*
  The profile's interactive controls: Save (local, no accounts yet) and the
  Request-introduction modal wired to the requestIntroduction server action.

  Rendered in three places (hero, decision panel, mobile bar), each an
  independent island. Save state is shared across them via localStorage + a
  window event, so toggling in one updates the others and survives a reload —
  a stopgap "shortlist" until firms have real accounts. localStorage is read in
  an effect (not during render) to avoid a hydration mismatch.

  Buttons use rounded-card (not the marketing pill) to match CandidateSearchCard:
  the candidate product surface is its own shape language.
*/

const FOCUS_PAPER =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
const FOCUS_NAVY =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

const savedKey = (id: string) => `at:saved-candidate:${id}`;
const SAVE_EVENT = "at:saved-candidate-changed";

export function CandidateActions({
  candidateId,
  candidateName,
  variant,
}: {
  candidateId: string;
  candidateName: string;
  variant: "hero" | "panel" | "mobile" | "cta";
}) {
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  // Sync saved state from localStorage on mount and whenever a sibling toggles.
  useEffect(() => {
    const read = () => {
      try {
        setSaved(localStorage.getItem(savedKey(candidateId)) === "1");
      } catch {
        /* storage unavailable */
      }
    };
    read();
    const onChange = (e: Event) => {
      if ((e as CustomEvent<string>).detail === candidateId) read();
    };
    window.addEventListener(SAVE_EVENT, onChange);
    return () => window.removeEventListener(SAVE_EVENT, onChange);
  }, [candidateId]);

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    try {
      localStorage.setItem(savedKey(candidateId), next ? "1" : "0");
      window.dispatchEvent(new CustomEvent(SAVE_EVENT, { detail: candidateId }));
    } catch {
      /* storage unavailable — in-memory only */
    }
  };

  const saveLabel = saved ? "Saved" : "Save candidate";
  const saveAria = `${saved ? "Saved" : "Save"} ${candidateName}`;

  const requestBtn = (extra: string) => (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`inline-flex items-center justify-center gap-2 rounded-card bg-paper px-5 py-3 text-small font-semibold text-navy transition hover:bg-mist active:translate-y-px ${FOCUS_PAPER} ${extra}`}
    >
      Request introduction
    </button>
  );

  // Navy-filled request button for light backgrounds (the closing process CTA).
  const requestBtnNavy = (extra: string) => (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`inline-flex items-center justify-center gap-2 rounded-card bg-navy px-6 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px ${FOCUS_NAVY} ${extra}`}
    >
      Request introduction
    </button>
  );

  const saveBtn = (extra: string) => (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saveAria}
      onClick={toggleSave}
      className={`inline-flex items-center justify-center gap-2 rounded-card border px-5 py-3 text-small font-semibold text-paper transition ${
        saved ? "border-verified bg-verified/10" : "border-paper/30 hover:border-paper/60"
      } ${FOCUS_PAPER} ${extra}`}
    >
      <BookmarkSimple
        size={16}
        weight={saved ? "fill" : "regular"}
        className={saved ? "text-verified" : ""}
        aria-hidden
      />
      {saveLabel}
    </button>
  );

  return (
    <>
      {variant === "hero" && (
        <div className="flex flex-wrap gap-2.5">
          {requestBtn("")}
          {saveBtn("")}
        </div>
      )}

      {variant === "panel" && (
        <div className="flex flex-col gap-2.5">
          {requestBtn("w-full")}
          {saveBtn("w-full")}
        </div>
      )}

      {variant === "cta" && requestBtnNavy("")}

      {variant === "mobile" && (
        <div className="flex gap-2.5">
          {requestBtn("flex-1")}
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saveAria}
            onClick={toggleSave}
            className={`inline-flex w-13 shrink-0 items-center justify-center rounded-card border transition ${
              saved ? "border-verified bg-verified/10" : "border-paper/30"
            } ${FOCUS_PAPER}`}
          >
            <BookmarkSimple
              size={18}
              weight={saved ? "fill" : "regular"}
              className={saved ? "text-verified" : "text-paper"}
              aria-hidden
            />
          </button>
        </div>
      )}

      {open && (
        <RequestIntroModal
          candidateId={candidateId}
          candidateName={candidateName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function RequestIntroModal({
  candidateId,
  candidateName,
  onClose,
}: {
  candidateId: string;
  candidateName: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<IntroState>({ status: "idle" });
  const [pending, start] = useTransition();
  // Stamped on mount (not during render, which must be pure) for the anti-bot
  // timing floor in requestIntroduction.
  const startedAt = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    start(async () => {
      const res = await requestIntroduction(candidateId, message, {
        startedAt: startedAt.current,
      });
      setState(res);
    });
  };

  const done = state.status === "success";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-6 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Request an introduction to ${candidateName}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-card bg-white p-7 shadow-[0_30px_70px_-30px_rgba(19,31,91,0.7)] lg:p-8"
      >
        {done ? (
          <div>
            <div className="flex size-12 items-center justify-center rounded-card bg-verified/10">
              <CheckCircle size={26} weight="fill" className="text-verified-deep" aria-hidden />
            </div>
            <h2 className="mt-4 font-display text-[1.4rem] font-medium text-navy">
              Request sent
            </h2>
            <p className="mt-2 text-small text-muted">
              Thanks. We’ll coordinate the introduction with {candidateName} and be in
              touch. Their contact details are shared only once they accept.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-card bg-navy px-5 py-3 text-small font-semibold text-white transition hover:bg-navy-deep active:translate-y-px ${FOCUS_NAVY}`}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-[1.45rem] font-medium text-navy">
              Request an introduction to {candidateName}
            </h2>
            <p className="mt-2 text-small text-muted">
              Tell us about the role. Your firm’s details are shared with the
              candidate; their contact details are revealed only once they accept.
            </p>

            <label
              htmlFor="intro-message"
              className="mt-5 block text-caption font-semibold text-ink"
            >
              Message to candidate{" "}
              <span className="font-normal text-subtle">(optional)</span>
            </label>
            <textarea
              id="intro-message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Brief note about the role, team and expected engagement."
              className={`mt-2 min-h-24 w-full resize-y rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy ${FOCUS_NAVY}`}
            />

            {state.status === "error" && (
              <p className="mt-3 flex items-start gap-2 text-caption text-navy">
                <WarningCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                {state.message}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-card border border-line px-5 py-3 text-small font-semibold text-ink transition hover:bg-mist ${FOCUS_NAVY}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className={`rounded-card bg-navy px-5 py-3 text-small font-semibold text-white transition hover:bg-navy-deep active:translate-y-px disabled:pointer-events-none disabled:opacity-60 ${FOCUS_NAVY}`}
              >
                {pending ? "Sending." : "Send request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
