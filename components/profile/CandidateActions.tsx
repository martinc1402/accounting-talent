"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  BookmarkSimple,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { requestIntroduction, type IntroState } from "@/app/actions";
import type { ProfileCtaState } from "@/lib/profile/candidate";

/*
  The profile's interactive controls. The primary action is DRIVEN BY the
  server-derived CTA state (profile.access.cta) — the client never decides
  entitlement; it only renders the state the server computed and, for the
  "request" state, opens the modal whose server action re-authorizes everything.

  Save is a verified-employer capability (canSave); it is hidden otherwise.
  Rendered in the hero (on navy), the decision panel (on navy), the mobile bar
  (on navy) and the closing process section (on light).
*/

const FOCUS_PAPER =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
const FOCUS_NAVY =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

const savedKey = (id: string) => `at:saved-candidate:${id}`;
const SAVE_EVENT = "at:saved-candidate-changed";

function statusLabel(status: string): string {
  switch (status) {
    case "requested":
      return "Introduction requested";
    case "under_review":
      return "Under review";
    case "candidate_invited":
      return "Candidate invited";
    case "accepted":
      return "Introduction accepted";
    default:
      return "Request submitted";
  }
}

export function CandidateActions({
  candidateId,
  candidateName,
  variant,
  cta = { kind: "request" },
  canSave = true,
}: {
  candidateId: string;
  candidateName: string;
  variant: "hero" | "panel" | "mobile" | "cta";
  cta?: ProfileCtaState;
  canSave?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

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
      /* storage unavailable */
    }
  };

  const saveLabel = saved ? "Saved" : "Save candidate";
  const saveAria = `${saved ? "Saved" : "Save"} ${candidateName}`;

  const tone: "onNavy" | "onLight" = variant === "cta" ? "onLight" : "onNavy";
  const solid =
    tone === "onLight"
      ? `bg-navy px-6 py-3 text-paper hover:bg-navy-deep ${FOCUS_NAVY}`
      : `bg-paper px-5 py-3 text-navy hover:bg-mist ${FOCUS_PAPER}`;
  const disabled =
    tone === "onLight"
      ? "border border-line px-6 py-3 text-subtle"
      : "border border-paper/30 px-5 py-3 text-paper/70";

  // The primary control, switched on the server-derived CTA state.
  const primaryBtn = (extra: string) => {
    const base = `inline-flex items-center justify-center gap-2 rounded-card text-small font-semibold transition active:translate-y-px ${extra}`;
    switch (cta.kind) {
      case "register":
        return (
          <a href="/login" className={`${base} ${solid}`}>
            Create an employer account
          </a>
        );
      case "verify":
        return (
          <a href="/employer" className={`${base} ${solid}`}>
            Verify to request introductions
          </a>
        );
      case "request":
        return (
          <button type="button" onClick={() => setOpen(true)} className={`${base} ${solid}`}>
            Request introduction
          </button>
        );
      case "accepted":
        return (
          <a href="#contact" className={`${base} ${solid}`}>
            View contact details
          </a>
        );
      case "status":
        return (
          <span className={`${base} ${disabled} cursor-default`} aria-disabled>
            <CheckCircle size={16} weight="fill" aria-hidden />
            {statusLabel(cta.status)}
          </span>
        );
      case "at_limit":
        return (
          <span className={`${base} ${disabled} cursor-not-allowed`} aria-disabled>
            Introduction limit reached
          </span>
        );
      case "preview":
        return (
          <span className={`${base} ${disabled} cursor-not-allowed`} aria-disabled>
            Preview mode — actions disabled
          </span>
        );
    }
  };

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

  const showSave = canSave && cta.kind !== "preview";

  return (
    <>
      {variant === "hero" && (
        <div className="flex flex-wrap gap-2.5">
          {primaryBtn("")}
          {showSave && saveBtn("")}
        </div>
      )}

      {variant === "panel" && (
        <div className="flex flex-col gap-2.5">
          {primaryBtn("w-full")}
          {showSave && saveBtn("w-full")}
        </div>
      )}

      {variant === "cta" && primaryBtn("")}

      {variant === "mobile" && (
        <div className="flex gap-2.5">
          {primaryBtn("flex-1")}
          {showSave && (
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
          )}
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
            <h2 className="mt-4 font-display text-[1.4rem] font-medium text-navy">Request sent</h2>
            <p className="mt-2 text-small text-muted">
              Thanks. We&rsquo;ll coordinate the introduction with {candidateName} and be in
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
              Tell us about the role. Your firm&rsquo;s details are shared with the candidate;
              their contact details are revealed only once they accept.
            </p>

            <label htmlFor="intro-message" className="mt-5 block text-caption font-semibold text-ink">
              Message to candidate <span className="font-normal text-subtle">(optional)</span>
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
