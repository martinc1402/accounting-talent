/*
  DEV-ONLY end-to-end auth test harness. Creates confirmed auth users for the
  admin + test-employer emails (with an ephemeral password, printed, never
  committed), makes the employer verified, seeds ONE real verified candidate, and
  mints valid @supabase/ssr session cookies (using the library's own encoder) so a
  browser can be driven as each identity without an email round-trip.

  Usage: node --env-file=.env.local scripts/dev-e2e-setup.mjs
  Output: JSON { candidateId, adminCookies, employerCookies, employerAccountId }.
*/
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "node:crypto";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = (process.env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();
const employerEmail = (process.env.LOCAL_TEST_EMPLOYER_EMAIL ?? "").trim().toLowerCase();

if (!url || !anon || !serviceKey || !adminEmail || !employerEmail) {
  console.error("Missing env (need SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPER_ADMIN_EMAIL, LOCAL_TEST_EMPLOYER_EMAIL).");
  process.exit(1);
}

const svc = createClient(url, serviceKey, { auth: { persistSession: false } });

async function findUser(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => (x.email ?? "").toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser(email) {
  const password = `Dev-${randomUUID()}`;
  let user = await findUser(email);
  if (user) {
    await svc.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  } else {
    const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    user = data.user;
  }
  await svc.from("profiles").upsert({ user_id: user.id, email }, { onConflict: "user_id" });
  return { user, password };
}

// Mint @supabase/ssr cookies by signing in (anon) then letting the ssr client
// serialize the session into an in-memory jar via its own setAll.
async function mintCookies(email, password) {
  const authClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { access_token, refresh_token } = data.session;

  const jar = new Map();
  const ssr = createServerClient(url, anon, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  await ssr.auth.setSession({ access_token, refresh_token });
  return [...jar.entries()].map(([name, value]) => ({
    name,
    value,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  }));
}

// --- users -----------------------------------------------------------------
const admin = await ensureUser(adminEmail);
const employer = await ensureUser(employerEmail);

// --- verified employer account for the test employer -----------------------
let { data: mem } = await svc
  .from("employer_members")
  .select("employer_account_id")
  .eq("user_id", employer.user.id)
  .limit(1)
  .maybeSingle();
let employerAccountId = mem?.employer_account_id;
if (!employerAccountId) {
  const { data: acct } = await svc
    .from("employer_accounts")
    .insert({ name: "Test Firm (local)", verification_state: "verified", plan: "free", verified_at: new Date().toISOString() })
    .select("id")
    .single();
  employerAccountId = acct.id;
  await svc.from("employer_members").insert({ employer_account_id: employerAccountId, user_id: employer.user.id, member_role: "owner" });
} else {
  await svc.from("employer_accounts").update({ verification_state: "verified", plan: "free", verified_at: new Date().toISOString() }).eq("id", employerAccountId);
}

// --- one real verified candidate (idempotent by a marker email) ------------
const markerEmail = "e2e.candidate@local.test";
let { data: existingCand } = await svc.from("applications").select("id").eq("email", markerEmail).maybeSingle();
let candidateId = existingCand?.id;
if (!candidateId) {
  const { data: cand, error } = await svc
    .from("applications")
    .insert({
      full_name: "Meera Krishnan",
      email: markerEmail,
      whatsapp: "+91 90000 11111",
      city: "Chennai",
      country: "India",
      state: "Tamil Nadu",
      linkedin: "https://www.linkedin.com/in/meera-krishnan-ca",
      qualification: "CA, India",
      experience_years: "5 years",
      experience_years_num: 5,
      experience_focus: "US tax",
      us_experience: "US federal and multi-state returns",
      role: "US Tax Preparer",
      accounting_software: ["QuickBooks Online"],
      tax_software: ["Drake", "Lacerte"],
      tax_forms: ["Form 1040", "Form 1120-S", "Form 1065", "Schedule C"],
      salary_expectation: "$1,000-$1,400 /mo",
      salary_min_usd: 1000,
      salary_max_usd: 1400,
      availability: "Available within 30 days",
      working_hours: "12:00 to 8:00 PM IST",
      start_date: "Within 30 days",
      source: "e2e",
      consent: true,
      tier: "fast_track",
      verified_at: new Date().toISOString(),
      identity_verified_at: new Date().toISOString(),
      qualification_verified_at: new Date().toISOString(),
      english_level: "Advanced",
      english_assessed_at: new Date().toISOString(),
      photo_url: "/images/candidate-headshot.jpg",
      photo_focal: "center 20%",
      et_overlap_hours: 4,
      employment_type: "Full-time",
      engagement: "Employer of record / contractor",
      willing_full_shift: true,
      professional_summary: "Meera is a US tax preparer with five busy seasons across an outsourced US CPA firm, strongest on 1040, 1120-S and 1065 engagements.",
      highlights: [
        { value: "350+", label: "US returns / season" },
        { value: "45+", label: "clients managed" },
        { value: "~25%", label: "fewer reviewer notes" },
      ],
      employment_history: [
        { title: "Senior Tax Associate", employer: "Whitfield & Roe CPA (US)", dates: "Jan 2021 to Present", bullets: ["Prepared 350+ US federal and multi-state returns per season.", "Owns 45+ SMB and individual clients end to end."], exposure: "US federal and multi-state returns" },
      ],
      education: [
        { qualification: "CA", institution: "ICAI", year: 2020, status: "Completed", completed: true },
        { qualification: "B.Com", institution: "University of Madras", year: 2017, status: "Completed", completed: true },
      ],
      software_proficiency: [
        { name: "QuickBooks Online", level: "Advanced", years: 5 },
        { name: "Drake", level: "Advanced", years: 5 },
      ],
      public_photo: false,
      public_compensation: true,
      allow_search_indexing: false,
    })
    .select("id")
    .single();
  if (error) throw error;
  candidateId = cand.id;
}

const adminCookies = await mintCookies(adminEmail, admin.password);
const employerCookies = await mintCookies(employerEmail, employer.password);

console.log(JSON.stringify({ candidateId, employerAccountId, adminCookies, employerCookies }, null, 2));
