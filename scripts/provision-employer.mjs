/*
  Turn a reviewed employer lead into a working employer account.

  This is the only way a firm gets an account. /employers writes a brief to
  employer_leads and deliberately creates nothing; /login only sends a link to an
  address that already has an account. So the chain is:

      firm submits brief  ->  employer_leads row  ->  you review it
                          ->  THIS SCRIPT         ->  they can sign in

  Without this step the firm is stuck: unknown addresses get the "no account"
  email, so they can never produce the auth.users row that an employer account
  needs. bootstrap-test-employer.mjs cannot fill the gap because it requires the
  user to have signed in already.

  Usage:
    node --env-file=.env.local scripts/provision-employer.mjs --email=them@firm.com
    node --env-file=.env.local scripts/provision-employer.mjs --email=them@firm.com --live
    node --env-file=.env.local scripts/provision-employer.mjs --email=them@firm.com --live --firm="Ledger & Co" --verified

  Dry run by default: prints exactly what it would do and changes nothing. Pass
  --live to write.

  The account is created UNVERIFIED unless --verified is passed. That is not
  timidity: verification is what opens candidate PII (see lib/authz/visibility.ts,
  where free_verified_employer and above can see more than anonymous), so it is
  an explicit decision per firm, never a side effect of provisioning. Pass
  --verified only once you have actually checked the firm out.

  Idempotent: re-running reuses the existing user, account and membership.
*/
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const LIVE = process.argv.includes("--live");
const VERIFIED = process.argv.includes("--verified");
const email = (arg("email") ?? "").trim().toLowerCase();
const firmOverride = arg("firm")?.trim();

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!email) {
  console.error("Missing --email=them@firm.com");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const say = (s) => console.log(`${LIVE ? "" : "[dry-run] "}${s}`);

// --- Refuse to make a candidate into an employer -----------------------------
// Same rule app/actions.ts createEmployerAccount enforces: an account is either
// an employer or a candidate, never both. Enforced here too, because a script
// running as service-role bypasses every check the app would have made.
const { data: ownedApp } = await db
  .from("applications")
  .select("id, full_name")
  .eq("email", email)
  .limit(1)
  .maybeSingle();
if (ownedApp) {
  console.error(
    `${email} has a candidate application (${ownedApp.full_name}). An account cannot be both.\n` +
      "Provision the firm under a different address.",
  );
  process.exit(1);
}

// --- Firm name, from the lead unless overridden ------------------------------
const { data: lead } = await db
  .from("employer_leads")
  .select("firm_name, full_name, role, created_at")
  .eq("work_email", email)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

const firmName = firmOverride ?? lead?.firm_name;
if (!firmName) {
  console.error(
    `No employer_leads row for ${email} and no --firm="…" given, so there is no name to use.`,
  );
  process.exit(1);
}
if (lead) {
  say(
    `Lead found: ${lead.firm_name} (${lead.full_name}), role "${lead.role}", submitted ${new Date(lead.created_at).toISOString().slice(0, 10)}.`,
  );
} else {
  say(`No lead on file; using --firm="${firmName}".`);
}

// --- Auth user ---------------------------------------------------------------
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

let user = await findUser();
if (user) {
  say(`Auth user exists (${user.id}).`);
} else {
  say(`Create auth user for ${email}.`);
  if (LIVE) {
    // email_confirm so they are not asked to verify separately: the magic link
    // they will use to sign in proves control of the address anyway. No
    // password is set, and none is ever needed.
    const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
    if (error) throw error;
    user = data.user;
    console.log(`Created auth user ${user.id}.`);
  }
}

// --- Profile: what makes them "known" to /login ------------------------------
say(`Upsert profiles row for ${email}.`);
if (LIVE) {
  await db.from("profiles").upsert({ user_id: user.id, email }, { onConflict: "user_id" });
}

// --- Account + membership ----------------------------------------------------
const { data: existingMembership } = LIVE
  ? await db
      .from("employer_members")
      .select("employer_account_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
  : { data: null };

if (existingMembership) {
  console.log(`Already a member of account ${existingMembership.employer_account_id}. Nothing to do.`);
} else {
  const state = VERIFIED ? "verified" : "unverified";
  say(`Create employer account "${firmName}" (${state}, free) and an owner membership.`);
  if (LIVE) {
    const { data: acct, error } = await db
      .from("employer_accounts")
      .insert({
        name: firmName,
        verification_state: state,
        plan: "free",
        verified_at: VERIFIED ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw error;
    await db
      .from("employer_members")
      .insert({ employer_account_id: acct.id, user_id: user.id, member_role: "owner" });
    console.log(`Created account ${acct.id} ("${firmName}", ${state}), owner ${email}.`);
  }
}

if (!VERIFIED) {
  say("Account is UNVERIFIED: they can sign in and see /employer, but cannot request introductions until verified.");
}
say(`${email} can now sign in at /login and will land on /employer.`);
if (!LIVE) console.log("\nNothing was written. Re-run with --live to apply.");
