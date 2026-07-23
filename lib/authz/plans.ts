/*
  Plan entitlements. Kept OUT of components so pricing/limits live in one place
  and billing can be wired later without touching UI. Platform role (admin) is
  deliberately NOT expressed here: an admin is not a paid employer, and paying
  never makes an employer verified — those are separate axes (see visibility.ts).
*/
import type { EmployerAccount, PlanName } from "./types";

export type Entitlements = {
  maxActiveIntroductions: number;
  priority: boolean;
  assessmentBreakdown: boolean;
  referenceSummaries: boolean;
  resumeDownload: boolean;
  recentAvailability: boolean;
};

// Paid concurrency is env-configurable so a plan change needs no code edit.
const PAID_MAX_ACTIVE = (() => {
  const n = Number(process.env.PAID_MAX_ACTIVE_INTRODUCTIONS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
})();

export const PLAN_ENTITLEMENTS: Record<PlanName, Entitlements> = {
  free: {
    maxActiveIntroductions: 1,
    priority: false,
    assessmentBreakdown: false,
    referenceSummaries: false,
    resumeDownload: false,
    recentAvailability: false,
  },
  paid: {
    maxActiveIntroductions: PAID_MAX_ACTIVE,
    priority: true,
    assessmentBreakdown: true,
    referenceSummaries: true,
    resumeDownload: true,
    recentAvailability: true,
  },
};

/** Entitlements for an account: plan defaults, with optional per-account jsonb
 *  overrides layered on top (so a specific account can be tuned without a
 *  migration or a new plan). A null account falls back to the free plan. */
export function entitlementsFor(account: EmployerAccount | null): Entitlements {
  const base = PLAN_ENTITLEMENTS[account?.plan ?? "free"] ?? PLAN_ENTITLEMENTS.free;
  const override = (account?.entitlements ?? {}) as Partial<Entitlements>;
  return { ...base, ...override };
}
