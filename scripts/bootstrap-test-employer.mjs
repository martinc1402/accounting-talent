/*
  Bootstrap the local test employer: attach a VERIFIED employer account (owner
  membership) to the user identified by LOCAL_TEST_EMPLOYER_EMAIL. Run AFTER that
  user has signed in once (magic link), so their auth.users row exists.

  Usage:
    node --env-file=.env.local scripts/bootstrap-test-employer.mjs

  Idempotent: re-running is safe. Uses the service-role key (server-only). Never
  weakens production rules — it only seeds a test account locally.
*/
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.LOCAL_TEST_EMPLOYER_EMAIL ?? "").trim().toLowerCase();

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!email) {
  console.error("Missing LOCAL_TEST_EMPLOYER_EMAIL.");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

// Find the auth user by email (paginate through admin.listUsers).
async function findUser() {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}

const user = await findUser();
if (!user) {
  console.error(
    `No auth user for ${email}. Sign in once at /login with that email, then re-run.`,
  );
  process.exit(1);
}

// Ensure profile.
await db.from("profiles").upsert({ user_id: user.id, email }, { onConflict: "user_id" });

// Ensure a membership + verified account.
const { data: existing } = await db
  .from("employer_members")
  .select("employer_account_id")
  .eq("user_id", user.id)
  .limit(1)
  .maybeSingle();

let accountId = existing?.employer_account_id;
if (accountId) {
  await db
    .from("employer_accounts")
    .update({ verification_state: "verified", verified_at: new Date().toISOString() })
    .eq("id", accountId);
  console.log(`Updated existing account ${accountId} -> verified.`);
} else {
  const { data: acct, error } = await db
    .from("employer_accounts")
    .insert({
      name: "Test Firm (local)",
      verification_state: "verified",
      plan: "free",
      verified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  accountId = acct.id;
  await db
    .from("employer_members")
    .insert({ employer_account_id: accountId, user_id: user.id, member_role: "owner" });
  console.log(`Created verified account ${accountId}, owner ${email}.`);
}

console.log("Done. The test employer is verified (free plan). Toggle free/paid via the admin control on a profile.");
