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
          await serviceClient
            .from("profiles")
            .upsert({ user_id: user.id, email: normalizeEmail(user.email) }, { onConflict: "user_id" });
        }
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
