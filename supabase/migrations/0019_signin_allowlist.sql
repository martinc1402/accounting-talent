-- Hard sign-in lock, enforced inside Supabase Auth rather than in our app.
--
-- WHY THIS EXISTS
-- lib/auth/allowlist.ts restricts POST /api/auth/signin, but that is only our
-- front door. NEXT_PUBLIC_SUPABASE_ANON_KEY ships in the browser bundle, so
-- anyone who reads it can call the GoTrue API directly:
--
--   POST https://<project>.supabase.co/auth/v1/otp
--   apikey: <anon key>            {"email":"anyone@example.com"}
--
-- and GoTrue will create the user and mail its own magic link, bypassing every
-- line of TypeScript we wrote. This migration closes that path in the only place
-- that can actually close it.
--
-- Additive, idempotent, re-runnable.
--
-- ============================================================================
-- TWO DASHBOARD STEPS ARE REQUIRED. This SQL alone does nothing.
-- ============================================================================
--
-- 1. Authentication -> Sign In / Providers -> Email:
--    turn OFF "Allow new users to sign up" (DISABLE_SIGNUP = true).
--    Effect: the anon-key call above starts failing with "Signups not allowed
--    for otp". Existing users can still request magic links. The service-role
--    admin API (auth.admin.generateLink / createUser) is NOT affected, so our
--    own sign-in route and scripts/provision-employer.mjs keep working. This
--    single toggle is the highest-value control here.
--
-- 2. Authentication -> Auth Hooks -> "Before User Created":
--    select Postgres, schema public, function hook_restrict_signup.
--
--    SCOPE, MEASURED RATHER THAN ASSUMED (2026-07-29, this project, hook live):
--      - admin.createUser with a NON-allowlisted address ...... SUCCEEDED
--      - admin.generateLink for an allowlisted address ........ succeeded
--      - anon-key POST /auth/v1/otp .......................... 422 signup_disabled
--
--    So this hook does NOT police the service-role admin API. It governs public
--    signup paths (email signup, OAuth auto-creation) — which step 1 has already
--    closed outright. Keep it anyway: it is the safety net for the day someone
--    re-enables signups without remembering why they were off. But do not treat
--    it as protection against a leaked service key or a bug in our own
--    server-side code, because it is not. Step 1 is the load-bearing control.
--
--    Corollary: scripts/provision-employer.mjs keeps working with the hook on.
--    An earlier version of this comment claimed it would fail. It does not.
--    Adding a row is still good hygiene when you onboard a firm, so the two
--    lists agree:
--      insert into signin_allowlist (email, note)
--      values ('them@firm.com', 'Ledger & Co, approved 2026-08-01');
--
-- To lift the restriction entirely: disable the hook, re-enable signups, and
-- empty the ALLOWED list in lib/auth/allowlist.ts. All three, or the lock is
-- only partly open and the failure looks like a bug.

create table if not exists signin_allowlist (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

comment on table signin_allowlist is
  'Addresses permitted to have a Supabase auth user. Enforced by the before-user-created hook below. Mirrors lib/auth/allowlist.ts, which gates our own sign-in route.';

-- Normalised on the way in so a capitalised address cannot slip past the lookup.
insert into signin_allowlist (email, note) values
  ('martinc140291@gmail.com',       'Operator / SUPER_ADMIN_EMAIL'),
  ('martinc140291@icloud.com',      'Operator; currently owns Sai''s application row'),
  ('saiswaminathanramji@gmail.com', 'Sai')
on conflict (email) do nothing;

alter table signin_allowlist enable row level security;
-- No policies: deny-all to anon and authenticated, exactly like every other
-- table here. The hook runs as supabase_auth_admin and the app reads it through
-- the service role, both of which bypass RLS.

/*
  The hook itself. Returns '{}' to allow creation, or an error object to deny it.

  Deny-by-default is the point: an address absent from the table cannot become a
  user, whatever created the request. Note the function is SECURITY DEFINER and
  pinned to an empty search_path so a rogue schema on the caller's path cannot
  redirect the table lookup.
*/
create or replace function public.hook_restrict_signup(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_email text;
  allowed int;
begin
  candidate_email := lower(trim(event->'user'->>'email'));

  -- No address on the event: refuse rather than guess.
  if candidate_email is null or candidate_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Sign-up is not open.',
        'http_code', 403
      )
    );
  end if;

  select count(*) into allowed
  from public.signin_allowlist
  where lower(email) = candidate_email;

  if allowed > 0 then
    return '{}'::jsonb;
  end if;

  -- Same wording for every refusal: the caller learns nothing about who does
  -- exist, matching the no-enumeration rule the sign-in route follows.
  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'Sign-up is not open.',
      'http_code', 403
    )
  );
end;
$$;

-- Auth runs the hook as supabase_auth_admin; nobody else may execute it, and
-- the table stays unreadable from the client.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_signup to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup from authenticated, anon, public;
grant select on table public.signin_allowlist to supabase_auth_admin;
