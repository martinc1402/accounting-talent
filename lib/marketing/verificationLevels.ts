import { CHECK_IDS, type CheckId } from "@/lib/candidate/checks";

/*
  What "verified" means on this site, said once, in the one place a test can reach.

  This is the documented exception to the "every user-facing string lives in
  content/*" rule, and the reason is the test next door. Verification copy makes
  claims about what the product checks, and the only way to stop that copy drifting
  ahead of the product is to assert it against lib/candidate/checks.ts on every
  `npm test`. The vitest include glob covers test files under lib/ and nothing
  else, so content/ is invisible to the suite and copy that must be tested has to
  live here instead.

  THE RULE THIS FILE EXISTS TO ENFORCE: there is no single "verified accountant"
  badge, because that would imply every claim on a profile has been checked and
  none of them have. Each check stands alone and carries its own date. A profile
  shows what was checked, and when, and nothing more.
*/

/*
  The four states a check can be in on a profile.

  "unavailable" is not padding. Some qualifications cannot be confirmed against
  any register we can reach, and saying so is more honest than leaving a check
  permanently blank and letting a firm read that as a failure.
*/
export type CheckState =
  | "verified"
  | "submitted"
  | "not-yet"
  | "unavailable";

export const checkStateLabels: Record<CheckState, string> = {
  verified: "Verified",
  submitted: "Submitted",
  "not-yet": "Not yet verified",
  unavailable: "Verification unavailable",
};

export type VerificationCheck = {
  id: CheckId;
  label: string;
  /** What a firm can conclude. Careful: only what the check actually establishes. */
  employer: string;
  /** What the accountant does. */
  accountant: string;
};

export const verificationChecks: readonly VerificationCheck[] = [
  {
    id: "identity",
    label: "Identity",
    employer:
      "A person at AccountingTalent has confirmed this accountant is who the profile says they are.",
    accountant:
      "Confirm your identity once. It is checked by a person, not by an automated service.",
  },
  {
    id: "english",
    label: "English writing",
    employer:
      "A written sample about the accountant's own work, assessed and dated. You can read how someone explains a problem before you spend an hour on a call.",
    accountant:
      "Write a few hundred words about a real problem you solved. Your own words, and they stay on your profile.",
  },
  {
    id: "qualification",
    label: "Qualification",
    employer:
      "The stated qualification has been checked against the evidence the accountant provided.",
    accountant:
      "Share your qualification once and it stops being a claim you have to re-argue with every employer.",
  },
] as const;

/*
  Checks a reader might reasonably expect that we deliberately do NOT perform.

  Naming the gaps is the point. A verification section that lists only what we do
  invites a firm to assume the rest is covered, and migration 0013 records that
  reference checking was removed on purpose: "no surface implies references are
  ever checked."
*/
export const verificationGaps: readonly { label: string; body: string }[] = [
  {
    label: "Reference checks",
    body: "We do not contact previous employers. Vouches from named colleagues are being built to do this job better, and are not live yet.",
  },
  {
    label: "Criminal-record and credit checks",
    body: "We do not run background screening. A firm that needs it should run it as part of its own hiring process.",
  },
  {
    label: "Right-to-work status",
    body: "Accountants on this network are based in India and work with your firm directly. Confirming what that means for your obligations is a question for your own advisors.",
  },
] as const;

/** Every check the app can stamp has marketing copy, in the app's own order. */
export function describedCheckIds(): readonly string[] {
  return verificationChecks.map((c) => c.id);
}

export { CHECK_IDS };
