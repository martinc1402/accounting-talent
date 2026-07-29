import "server-only";
import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/authz/email";

/*
  Identity questions the sign-in flow asks, in one place: does this address have
  an account, and where does its owner belong after the click.
*/

/**
 * Does an account exist for this address?
 *
 * Two ways to qualify, and both matter:
 *  - a profiles row, written by the auth callback on every sign-in, so anyone
 *    who has ever signed in (candidate, employer or neither) is known; and
 *  - an applications row, so a candidate who applied but has never signed in can
 *    still get in. Their auth user is created on the spot by generateLink.
 *
 * Only a "yes" here may lead to generateLink. That call CREATES the auth user
 * when one does not exist, so calling it for an unknown address would let anyone
 * mint accounts by typing an email into the form.
 *
 * Fails closed: an unconfigured or erroring database means no link goes out.
 */
export async function isKnownAccount(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || !supabase) return false;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();
    if (profile) return true;

    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();
    return Boolean(application);
  } catch {
    return false;
  }
}

/**
 * Where a freshly signed-in user lands when the link carries no explicit
 * destination.
 *
 * Candidate wins when a user is somehow both. The two roles are meant to be
 * mutually exclusive (app/actions.ts createEmployerAccount refuses to make an
 * employer out of a candidate, and the auth callback refuses to claim
 * applications for an employer), but nothing in the schema enforces it and the
 * dev scripts write memberships directly. When it does happen, the candidate
 * dashboard is the safer landing: it shows a person their own data, where the
 * employer area would offer them someone else's.
 *
 * Note this is the opposite precedence to lib/authz/viewer.ts, which resolves
 * employer first. Deliberate, and only observable for an account holding both.
 */
export async function destinationForUser(userId: string): Promise<string> {
  if (!supabase) return "/";

  try {
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (application) return "/candidates/me";

    const { data: membership } = await supabase
      .from("employer_members")
      .select("user_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (membership) return "/employer";
  } catch {
    // Fall through to the homepage rather than failing a valid sign-in.
  }

  return "/";
}

/**
 * A caller-supplied "next" is a redirect target, so it is only ever accepted as
 * a path on this site: it must start with a single slash. "//evil.com" and
 * "https://evil.com" are both rejected.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
