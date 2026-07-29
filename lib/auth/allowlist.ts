import { normalizeEmail } from "@/lib/authz/email";

/*
  Who may sign in at all, at this stage.

  Without this, "has an account" means a profiles row OR an applications row —
  and there are 118 distinct applicant addresses, every one of which would
  receive a working sign-in link. That is the designed end state, but not yet:
  right now only the two operator accounts and Sai need to get in.

  Deliberately a list in the repo rather than an env var or a database table, for
  the same reason as EMPLOYER_SIGNUP_OPEN: widening who can sign in should arrive
  as a diff someone reviewed, not as a value quietly edited somewhere.

  IMPORTANT: this is the soft half of the lock. It governs OUR sign-in route, and
  nothing else. The anon key is public (it ships in the browser bundle), so the
  hard half has to live in Supabase itself — see
  supabase/migrations/0019_signin_allowlist.sql and the dashboard steps in its
  header. Deleting this file would reopen sign-in to all 118; deleting the
  Supabase half would reopen account creation to the entire internet.

  Note this list is what actually restricts the three operators/Sai. The Supabase
  side stops STRANGERS creating accounts; it does not stop an existing applicant
  signing in, because their address is already known to us. Both halves are
  needed and they do different jobs.

  To retire the whole mechanism, empty the list: an empty allowlist means "no
  restriction", so the behaviour falls back to the account check alone.
*/
const ALLOWED: readonly string[] = [
  "martinc140291@gmail.com", // operator / SUPER_ADMIN_EMAIL
  "martinc140291@icloud.com", // operator, currently owns Sai's application row
  "saiswaminathanramji@gmail.com", // Sai
];

const ALLOWED_SET = new Set(ALLOWED.map((e) => normalizeEmail(e)));

/** True when this address is permitted to receive a sign-in link. */
export function isAllowedToSignIn(email: string): boolean {
  if (ALLOWED_SET.size === 0) return true; // empty list = restriction lifted
  return ALLOWED_SET.has(normalizeEmail(email));
}

/** For scripts and diagnostics that need to report the current restriction. */
export const signInAllowlist: readonly string[] = ALLOWED;
