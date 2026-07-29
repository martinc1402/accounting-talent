-- Candidate ownership: links an application to the auth user who owns it (the
-- candidate). Populated by auto-claim on magic-link login (app/auth/callback),
-- matching the verified auth email to the application email. Enables candidate
-- self-view (owner) and the "owner may view their own photo" rule. Nullable —
-- most historical applications are unclaimed until the candidate logs in.
alter table applications add column if not exists user_id uuid references auth.users(id);
create index if not exists applications_user_id_idx on applications(user_id);
