/*
  Introduction lifecycle: the allowed state machine, the "is this active" test
  (backs the per-plan concurrency limit and the DB partial-unique index), and the
  pure create-eligibility decision. All decision logic is pure and I/O-free so the
  server actions can stay thin and every rule is unit-tested directly.
*/
import type { IntroductionStatus, VisibilityLevel } from "./types";
import type { Entitlements } from "./plans";
import { canSeeVerifiedEmployerFields } from "./visibility";

/** Statuses that occupy a "slot" against the plan limit and the active-uniqueness
 *  constraint. Must stay in sync with the partial unique index in migration 0012. */
export const ACTIVE_INTRO_STATUSES: readonly IntroductionStatus[] = [
  "requested",
  "under_review",
  "candidate_invited",
  "accepted",
] as const;

export function isActiveStatus(status: IntroductionStatus): boolean {
  return ACTIVE_INTRO_STATUSES.includes(status);
}

/** Allowed transitions. Terminal states have no outgoing edges. */
const TRANSITIONS: Record<IntroductionStatus, readonly IntroductionStatus[]> = {
  requested: ["under_review", "cancelled", "expired"],
  under_review: ["candidate_invited", "declined", "cancelled", "expired"],
  candidate_invited: ["accepted", "declined", "cancelled", "expired"],
  accepted: [],
  declined: [],
  cancelled: [],
  expired: [],
};

export function validateTransition(from: IntroductionStatus, to: IntroductionStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export type CreateEligibility =
  | { ok: true }
  | { ok: false; reason: "not_verified" | "at_limit" };

/**
 * Whether the viewer may create a new introduction right now. Server-enforced;
 * the UI mirrors it but never decides it.
 * @param activeCount current count of the account's active introductions
 */
export function canCreateIntroduction(args: {
  level: VisibilityLevel;
  activeCount: number;
  entitlements: Entitlements;
}): CreateEligibility {
  if (!canSeeVerifiedEmployerFields(args.level)) return { ok: false, reason: "not_verified" };
  if (args.activeCount >= args.entitlements.maxActiveIntroductions) {
    return { ok: false, reason: "at_limit" };
  }
  return { ok: true };
}
