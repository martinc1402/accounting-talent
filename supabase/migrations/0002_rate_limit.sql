-- Per-IP submission rate limiting for the public form actions.
--
-- Same lockdown as 0001: RLS on with no policies, so only the server actions
-- (service role key) can read or write. Never add a public policy.
--
-- Raw IPs are never stored. ip_hash is sha256(salt + ip), computed in
-- lib/ratelimit.ts, so the table holds no reversible personal data. Rows are
-- written only for allowed attempts (at most `limit` per key per window) and the
-- limiter deletes a key's expired rows as it goes, so the table stays small. At
-- higher volume, a scheduled `delete from rate_limit_hits where created_at <
-- now() - interval '1 hour'` (pg_cron) is the cleanup to add; not needed yet.

create table if not exists rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  -- Which endpoint the attempt hit: 'apply' | 'waitlist'. Buckets are separate
  -- so a firm joining the waitlist is never limited by apply traffic.
  bucket text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_lookup_idx
  on rate_limit_hits (bucket, ip_hash, created_at desc);

alter table rate_limit_hits enable row level security;
