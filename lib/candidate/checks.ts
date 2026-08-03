/*
  The canonical set of AccountingTalent verification checks.

  This used to be a private const inside app/actions.ts. It moved here because the
  marketing pages now describe these checks by name, and a description of a check
  the app cannot actually perform is the worst kind of copy: it reads as a
  commitment and nothing in the build objects to it.

  With the set exported from one place, lib/marketing/verificationLevels.test.ts
  can assert that the marketing vocabulary and the app's capability are the same
  list. Adding a fourth check to a page without adding it to the product now fails
  the test suite.

  These are ACCOUNTINGTALENT checks (an admin stamps them after reviewing
  evidence). They are not candidate self-confirmations, which live separately as
  CONFIRM_COLUMNS in app/actions.ts and mean something much weaker: "the candidate
  says this is still true as of this date".

  Deliberately three. supabase/migrations/0013_drop_references_check.sql removed
  reference checking with the reasoning that "contacting prior employers per
  candidate is too much overhead for the marginal trust. The verification set is
  now exactly Identity / English / Qualification, and no surface implies
  references are ever checked." That decision stands. Do not re-add a fourth here
  to make a marketing section look fuller.
*/
export const CHECK_IDS = ["identity", "english", "qualification"] as const;

export type CheckId = (typeof CHECK_IDS)[number];

/** An AccountingTalent check to the timestamp column it stamps. */
export const CHECK_COLUMNS: Record<CheckId, string> = {
  identity: "identity_verified_at",
  english: "english_assessed_at",
  qualification: "qualification_verified_at",
};

/*
  adminVerifyCheck takes `check` as a plain string off a form, so it has to narrow
  before it can index. The runtime guard was already there ("Unknown check."); this
  just lets the type system agree with it instead of widening the record back to
  Record<string, string> and losing the exhaustiveness the test relies on.
*/
export function isCheckId(value: string): value is CheckId {
  return (CHECK_IDS as readonly string[]).includes(value);
}
