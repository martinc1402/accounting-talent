/*
  Shared authorization types. Kept dependency-free (no imports from the profile
  view-model or Supabase) so both the policy layer and the candidate view-model
  can import from here without a cycle.
*/

export type VisibilityLevel =
  | "anonymous"
  | "unverified_employer"
  | "free_verified_employer"
  | "paid_verified_employer"
  | "accepted_introduction"
  // The candidate viewing THEIR OWN profile (per-application ownership; resolved in
  // the route, never by deriveVisibility). Sees their own identity + clear photo.
  | "owner"
  | "admin";

export type PlanName = "free" | "paid";
export type VerificationState = "unverified" | "pending" | "verified" | "rejected";
export type MemberRole = "owner" | "member";

export type EmployerAccount = {
  id: string;
  name: string;
  verificationState: VerificationState;
  plan: PlanName;
  entitlements?: Record<string, unknown> | null;
};

/** The resolved caller. Anonymous is the safe default for any uncertainty. */
export type Viewer =
  | { kind: "anonymous" }
  | {
      kind: "user";
      userId: string;
      email: string;
      isAdmin: boolean;
      account: EmployerAccount | null;
      memberRole: MemberRole | null;
    };

export type IntroductionStatus =
  | "requested"
  | "under_review"
  | "candidate_invited"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired";

/** The viewer's OWN introduction for a given candidate (fetched by account id),
 *  so it can never carry another employer's request. */
export type Introduction = {
  id: string;
  applicationId: string;
  employerAccountId: string | null;
  status: IntroductionStatus;
  createdAt: string;
};
