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
        let dest = next;
        if (user && serviceClient) {
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
            // Smart landing: a candidate with no explicit destination lands on their
            // own dashboard.
            if (dest === "/") {
              const { data: owned } = await serviceClient
                .from("applications")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .maybeSingle();
              if (owned) dest = "/candidates/me";
            }
          }
        }
        return NextResponse.redirect(new URL(dest, url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
