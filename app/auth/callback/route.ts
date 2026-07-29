import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAuthServerClient } from "@/lib/supabase/server";
import { supabase as serviceClient } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/authz/email";
import { destinationForUser, safeNext } from "@/lib/auth/accounts";
import { readLinkToken } from "@/lib/auth/linkToken";

/*
  Magic-link return. Establishes the session (writing the auth cookies), then
  upserts a profiles row for the user via the service role. Never trusts a
  caller-supplied identity: the user comes from the redeemed token.

  Two ways in, because the flow changed:
  - ?t=  the current path. The token was generated server-side by
         /api/auth/signin and wrapped with a 15-minute deadline, and is redeemed
         with verifyOtp. Not PKCE, so the link works in any browser, not only the
         one that asked for it.
  - ?code= the old browser-initiated PKCE path. Kept only so links already sitting
         in inboxes when this shipped still work. Safe to delete once they have
         all expired.
*/

async function establishSession(
  client: SupabaseClient,
  url: URL,
): Promise<boolean> {
  const wrapped = url.searchParams.get("t");
  if (wrapped) {
    const tokenHash = readLinkToken(wrapped);
    // Null covers a bad signature, a tampered payload, and an expired deadline
    // alike. Supabase then enforces single use on the token itself.
    if (!tokenHash) return false;
    const { error } = await client.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });
    return !error;
  }

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    return !error;
  }

  return false;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const failed = NextResponse.redirect(new URL("/login?error=1", url.origin));

  const client = await createAuthServerClient();
  if (!client) return failed;
  if (!(await establishSession(client, url))) return failed;

  const { data } = await client.auth.getUser();
  const user = data.user;
  if (!user) return failed;

  // An explicit destination wins: this is what /login?next=... has always meant.
  // Otherwise the account's own role decides where it belongs.
  let dest = safeNext(url.searchParams.get("next"));

  if (serviceClient) {
    const email = normalizeEmail(user.email);
    await serviceClient
      .from("profiles")
      .upsert({ user_id: user.id, email }, { onConflict: "user_id" });
    // An account is either an employer OR a candidate, never both. Only claim
    // candidate applications for users who are NOT employers.
    const { data: membership } = await serviceClient
      .from("employer_members")
      .select("user_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!membership && email) {
      // Candidate ownership auto-claim: the magic link proves control of this
      // email, so any application submitted with it belongs to this user. Claim
      // all still-unclaimed matching rows (a candidate may have applied twice).
      await serviceClient
        .from("applications")
        .update({ user_id: user.id })
        .eq("email", email)
        .is("user_id", null);
    }
    // Resolved after the claim above, so a first-time candidate lands on the
    // dashboard for the application they just took ownership of.
    if (!dest) dest = await destinationForUser(user.id);
  }

  return NextResponse.redirect(new URL(dest ?? "/", url.origin));
}
