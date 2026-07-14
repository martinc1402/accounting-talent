import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Server-only client using the service role key. The applications table has RLS
  enabled with no public policies, so the anon key cannot read or write it: the
  service role is the only way in, and it never leaves the server.

  Until the keys exist the client is null and callers fall back to logging, so
  the form is fully exercisable locally with no Supabase project.
*/
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const supabaseConfigured = supabase !== null;
