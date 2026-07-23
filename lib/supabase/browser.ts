"use client";

/*
  Browser Supabase client — AUTH ONLY (magic-link sign-in and reading the local
  session). It uses the public anon key and MUST NOT be used to query app tables:
  every table is RLS deny-all, so it would get nothing anyway, and all candidate
  data is served through server-side projections. Keep it to auth.* calls.
*/
import { createBrowserClient } from "@supabase/ssr";

export function createAuthBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase auth is not configured (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY).");
  }
  return createBrowserClient(url, anon);
}
