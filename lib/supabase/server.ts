import "server-only";

/*
  Server-side Supabase AUTH client (anon key + request cookies). Its ONLY job is
  to read the verified session/user for authorization. It never queries app
  tables (those go through the service-role client in lib/supabase.ts behind
  server-side projections). Separate from that privileged client on purpose.

  In a Server Component cookies() is read-only; setAll is a no-op there and the
  proxy (proxy.ts) is what actually refreshes the auth cookie.
*/
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — cookies are read-only here.
          // The proxy refreshes them instead. Safe to ignore.
        }
      },
    },
  });
}

export type AuthUser = { id: string; email: string; emailConfirmedAt: string | null };

/** The verified auth user, or null. Uses getUser() (which re-validates the token
 *  with Supabase Auth) rather than getSession() (which trusts the cookie). */
export async function getAuthUser(): Promise<AuthUser | null> {
  const client = await createAuthServerClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      emailConfirmedAt: data.user.email_confirmed_at ?? null,
    };
  } catch {
    return null;
  }
}
