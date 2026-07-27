import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";
import { supabase as serviceClient } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/authz/email";

/*
  Magic-link return. Exchanges the code for a session (writing the auth cookies),
  then upserts a profiles row for the user via the service role. Never trusts a
  caller-supplied identity: the user comes from the exchanged session.
*/
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const client = await createAuthServerClient();
    if (client) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) {
        const { data } = await client.auth.getUser();
        const user = data.user;
        if (user && serviceClient) {
          const email = normalizeEmail(user.email);
          await serviceClient
            .from("profiles")
            .upsert({ user_id: user.id, email }, { onConflict: "user_id" });
          // Candidate ownership auto-claim: the magic link proves control of this
          // email, so any application submitted with it belongs to this user. Claim
          // all still-unclaimed matching rows (a candidate may have applied twice).
          if (email) {
            await serviceClient
              .from("applications")
              .update({ user_id: user.id })
              .eq("email", email)
              .is("user_id", null);
          }
        }
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
