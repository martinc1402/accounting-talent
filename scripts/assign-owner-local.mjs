/*
  LOCAL TEST ONLY: link an application to an auth user so you can walk the owner
  (candidate self-view) login path. Get-or-creates the auth user for --email and
  sets applications.user_id on --id. Reversible (see the printed revert command).

    node --env-file=.env.local scripts/assign-owner-local.mjs --email=you@x.com --id=<appId>
*/
import { createClient } from "@supabase/supabase-js";

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const email = (arg("email") ?? "").trim().toLowerCase();
const id = arg("id");
if (!email || !id) {
  console.error("Usage: --email=<email> --id=<applicationId>");
  process.exit(1);
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1. Find (or create) the auth user for this email.
let userId;
const { data: list, error: listErr } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listErr) {
  console.error("listUsers failed:", listErr.message);
  process.exit(1);
}
const existing = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
if (existing) {
  userId = existing.id;
  console.log("Found existing auth user:", email, userId);
} else {
  const { data: created, error: createErr } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (createErr) {
    console.error("createUser failed:", createErr.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log("Created auth user:", email, userId);
}

// 2. Link the application to that user (ownership).
const { data: before } = await db.from("applications").select("full_name, user_id").eq("id", id).maybeSingle();
if (!before) {
  console.error("No application", id);
  process.exit(1);
}
const { error: updErr } = await db.from("applications").update({ user_id: userId }).eq("id", id);
if (updErr) {
  console.error("update failed:", updErr.message);
  process.exit(1);
}
console.log(`Linked application "${before.full_name}" (${id}) -> owner ${email}.`);
console.log(`  (was user_id: ${before.user_id ?? "null"})`);
console.log(`\nNow log in at http://localhost:3000/login with ${email} — the magic link lands you on /candidates/me as the owner.`);
console.log(`\nRevert:  node --env-file=.env.local -e 'import("@supabase/supabase-js").then(async({createClient})=>{const d=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});await d.from("applications").update({user_id:null}).eq("id","${id}");console.log("reverted");})'`);
