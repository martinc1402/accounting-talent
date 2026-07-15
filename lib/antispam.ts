import "server-only";

/*
  A lightweight bot filter for the public form actions, not a fortress.

  Two cheap signals:
  - a honeypot field that is off-screen and aria-hidden, so a human never fills
    it but a form-filling bot usually does;
  - the time between the form rendering and the submission arriving. A person
    takes seconds to minutes; an automated POST arrives in milliseconds.

  A hit does NOT show an error. The caller returns its normal success state
  without writing anything, so the bot believes it succeeded and moves on rather
  than adapting. Real submissions that trip a check are the failure mode to
  avoid, which is why the timing floors are set well below any human speed.
*/
export function isLikelyBot({
  hp,
  startedAt,
  minMs,
}: {
  /** The honeypot field's value. Non-empty means a bot filled it. */
  hp?: string | null;
  /** Client timestamp (ms) captured when the form rendered. */
  startedAt?: number | null;
  /** Reject submissions faster than this many ms from render. */
  minMs: number;
}): boolean {
  if (hp && hp.trim() !== "") return true;

  // Only judge timing when we actually have a plausible timestamp. A missing or
  // garbage value is treated as "no signal" rather than a positive, so a real
  // submission is never dropped just because the stamp did not arrive.
  if (typeof startedAt === "number" && Number.isFinite(startedAt)) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < minMs) return true;
  }

  return false;
}
