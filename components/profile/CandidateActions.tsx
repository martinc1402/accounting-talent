"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  BookmarkSimple,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  requestIntroduction,
  saveCandidate,
  unsaveCandidate,
  type IntroState,
} from "@/app/actions";
import type { ProfileCtaState } from "@/lib/profile/candidate";

/*
  The profile's interactive controls. The primary action is DRIVEN BY the
  server-derived CTA state (profile.access.cta) — the client never decides
  entitlement; it only renders the state the server computed and, for the
  "request" state, opens the modal whose server action re-authorizes everything.

  Save is persisted server-side, scoped to the employer account (saveMode:
  "toggle" for verified employers, "signin"/"verify" prompts otherwise, "hidden"
  in preview/admin). Rendered on navy (hero, decision panel) and light (cta).
*/

const FOCUS_PAPER =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
const FOCUS_NAVY =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

export type SaveMode = "toggle" | "signin" | "verify" | "hidden";

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
  saveMode = "hidden",
  initialSaved = false,
  previewDisabled = false,
}: {
  candidateId: string;
  candidateName: string;
  variant: "hero" | "panel" | "mobile" | "cta";
  cta?: ProfileCtaState;
  saveMode?: SaveMode;
  initialSaved?: boolean;
  /** Owner previewing as an employer: render the real buttons but non-functional. */
  previewDisabled?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [savePending, startSave] = useTransition();
  const [saveNote, setSaveNote] = useState("");
  const [open, setOpen] = useState(false);

  // Keep every Save button for this candidate on the page (hero + Decision
  // Summary) in lockstep: each instance broadcasts its new state and mirrors the
  // others'. Same-page only — persistence is the server action.
  useEffect(() => {
    const onSync = (e: Event) => {
      const d = (e as CustomEvent<{ id: string; saved: boolean }>).detail;
      if (d?.id === candidateId) setSaved(d.saved);
    };
    window.addEventListener("at:candidate-save", onSync as EventListener);
    return () => window.removeEventListener("at:candidate-save", onSync as EventListener);
  }, [candidateId]);
  const broadcastSave = (value: boolean) =>
    window.dispatchEvent(new CustomEvent("at:candidate-save", { detail: { id: candidateId, saved: value } }));

  const toggleSave = () => {
    // Verified employers persist; others are prompted to sign in / verify.
    if (saveMode === "signin") {
      window.location.href = "/login?next=" + encodeURIComponent(`/candidates/${candidateId}`);
      return;
    }
    if (saveMode === "verify") {
      window.location.href = "/employer";
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    broadcastSave(next);
    startSave(async () => {
      const res = next ? await saveCandidate(candidateId) : await unsaveCandidate(candidateId);
      if (res.status === "error") {
        setSaved(!next); // revert
        broadcastSave(!next);
        setSaveNote(res.message ?? "Could not update.");
      } else {
        setSaveNote(next ? "Saved to your shortlist." : "Removed from your shortlist.");
      }
    });
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
  const outline =
    tone === "onLight"
      ? `border border-navy/30 px-6 py-3 text-navy hover:bg-navy/5 ${FOCUS_NAVY}`
      : `border border-paper/40 px-5 py-3 text-paper hover:bg-paper/10 ${FOCUS_PAPER}`;

  const BASE = "inline-flex items-center justify-center gap-2 rounded-card text-small font-semibold transition active:translate-y-px";

  // Owner self-view buttons (route to the dashboard / into preview).
  const editBtn = (extra: string) => (
    <a href="/candidates/me" className={`${BASE} ${extra} ${solid}`}>
      Edit profile
    </a>
  );
  const previewBtn = (extra: string) => (
    <a href="?viewAs=employer" className={`${BASE} ${extra} ${outline}`}>
      Preview as employer
    </a>
  );

  // Owner-preview: the real employer label, rendered inert.
  const previewLabel =
    cta.kind === "register"
      ? "Create an employer account"
      : cta.kind === "accepted"
        ? "View introduction details"
        : "Request introduction";

  // The primary control, switched on the server-derived CTA state.
  const primaryBtn = (extra: string) => {
    const base = `${BASE} ${extra}`;
    if (previewDisabled) {
      return (
        <span className={`${base} ${disabled} cursor-not-allowed`} aria-disabled>
          {previewLabel}
        </span>
      );
    }
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
            View introduction details
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
          <a href="/employer" className={`${base} ${solid}`}>
            Upgrade to request another
          </a>
        );
      case "preview":
        return (
          <span className={`${base} ${disabled} cursor-not-allowed`} aria-disabled>
            Preview mode — actions disabled
          </span>
        );
      case "self":
        return (
          <span className={`${base} ${disabled} cursor-default`} aria-disabled>
            This is your profile
          </span>
        );
    }
  };

  const saveBtn = (extra: string) => (
    <button
      type="button"
      aria-pressed={previewDisabled ? undefined : saveMode === "toggle" ? saved : undefined}
      aria-label={saveAria}
      aria-disabled={previewDisabled || undefined}
      disabled={savePending || previewDisabled}
      onClick={previewDisabled ? undefined : toggleSave}
      className={`inline-flex items-center justify-center gap-2 rounded-card border px-5 py-3 text-small font-semibold text-paper transition disabled:opacity-70 ${
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

  const isSelf = cta.kind === "self" && !previewDisabled;
  // In owner-preview show the (disabled) Save for fidelity; otherwise hide it in
  // preview / self states.
  const showSave = previewDisabled
    ? saveMode !== "hidden"
    : saveMode !== "hidden" && cta.kind !== "preview" && cta.kind !== "self";

  return (
    <>
      {/* Restrained, accessible confirmation of the save toggle. */}
      <span className="sr-only" role="status" aria-live="polite">
        {saveNote}
      </span>

      {/* Owner self-view: Edit profile + Preview as employer (per variant). */}
      {variant === "hero" && (
        <div className="flex flex-wrap gap-2.5">
          {isSelf ? (
            <>
              {editBtn("")}
              {previewBtn("")}
            </>
          ) : (
            <>
              {primaryBtn("")}
              {showSave && saveBtn("")}
            </>
          )}
        </div>
      )}

      {variant === "panel" && (
        <div className="flex flex-col gap-2.5">
          {isSelf ? (
            previewBtn("w-full")
          ) : (
            <>
              {primaryBtn("w-full")}
              {showSave && saveBtn("w-full")}
            </>
          )}
        </div>
      )}

      {variant === "cta" && (isSelf ? editBtn("") : primaryBtn(""))}

      {/* Mobile bar shows only the primary action (compensation sits beside it in
          the sticky bar); Save stays in the hero + Decision Summary. */}
      {variant === "mobile" && (isSelf ? editBtn("w-full") : primaryBtn("w-full"))}

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
