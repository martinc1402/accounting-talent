"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import type { Answers } from "@/content/form";
import { stateForCity } from "@/content/cities";
import { validateAll, visibleQuestions } from "@/lib/validate";
import { scoreApplication } from "@/lib/scoring";
import { isLikelyBot } from "@/lib/antispam";
import { isRateLimited } from "@/lib/ratelimit";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { firms } from "@/content/firms";
import {
  emailApplicationReceived,
  emailEmployerLeadReceived,
  firstNameOf,
  sendEmail,
} from "@/lib/assessment/emails";
import { getViewer } from "@/lib/authz/viewer";
import { deriveVisibility, isApplicationOwner } from "@/lib/authz/visibility";
import { publicationRequirements, type ReadinessRow } from "@/lib/authz/readiness";
import { entitlementsFor } from "@/lib/authz/plans";
import { canCreateIntroduction } from "@/lib/authz/introductions";
import {
  countActiveIntroductions,
  getViewerIntroduction,
  insertIntroduction,
  transitionIntroduction,
} from "@/lib/authz/introductionsRepo";
import type { IntroductionStatus } from "@/lib/authz/types";

/*
  Server Functions are reachable by direct POST, not just through our UI, so
  everything here re-validates from scratch and never trusts the client.
*/

// The client IP, from the proxy headers Vercel sets. "unknown" is a real
// bucket, not a bypass: locally every request lands there together, which is
// exactly what makes the rate limit testable without a real IP.
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

// One line per dropped submission, structured so it is greppable in the logs.
// Only a short prefix of the (already hashed) IP is emitted.
function logDrop(form: string, reason: string, ipHash: string) {
  console.warn(
    `[guard] drop form=${form} reason=${reason} ip=${ipHash.slice(0, 12)}`,
  );
}

export type ApplyState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

type Utm = { source?: string; medium?: string; campaign?: string };
type Guard = { hp?: string; startedAt?: number };

export async function submitApplication(
  raw: Answers,
  utm: Utm = {},
  guard: Guard = {},
): Promise<ApplyState> {
  // Guards run cheapest-first, and every hit returns the normal success shape
  // without persisting, so a bot never learns it was caught. Honeypot + timing
  // are free; the rate limit is a DB round trip, so it runs second. The wizard
  // takes minutes, hence the generous 3s floor.
  const ip = await clientIp();

  if (isLikelyBot({ hp: guard.hp, startedAt: guard.startedAt, minMs: 3000 })) {
    logDrop("apply", "honeypot-or-timing", ip);
    return { status: "success" };
  }

  const rl = await isRateLimited("apply", ip, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.limited) {
    logDrop("apply", "rate_limit", rl.ipHash);
    return { status: "success" };
  }

  const errors = validateAll(raw);
  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Some answers need fixing before we can submit this.",
      errors,
    };
  }

  // Drop answers to questions that no longer apply. Someone who answers "yes"
  // to Q8, answers Q8a, then goes back and switches to "no" would otherwise
  // leave a stale setting behind.
  const visible = new Set(visibleQuestions(raw).map((q) => q.id));
  const answers: Answers = Object.fromEntries(
    Object.entries(raw).filter(([id]) => visible.has(id)),
  );

  const tier = scoreApplication(answers);
  const str = (k: string) => {
    const v = answers[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() ? s.trim() : null;
  };
  const arr = (k: string) => {
    const v = answers[k];
    return Array.isArray(v) ? v : v ? [v] : [];
  };

  const city = str("city") ?? "";

  const row = {
    full_name: str("full_name"),
    email: str("email")?.toLowerCase(),
    whatsapp: str("whatsapp"),
    city,
    state: stateForCity(city),
    linkedin: str("linkedin"),
    qualification: str("qualification"),
    experience_years: str("experience_years"),
    us_experience: str("us_experience"),
    us_experience_setting: str("us_experience_setting"),
    role: str("role"),
    accounting_software: arr("accounting_software"),
    tax_software: arr("tax_software"),
    tax_forms: arr("tax_forms"),
    salary_expectation: str("salary_expectation"),
    availability: str("availability"),
    working_hours: str("working_hours"),
    start_date: str("start_date"),
    home_setup: arr("home_setup"),
    source: str("source"),
    referrer: str("referrer"),
    consent: arr("consent").length > 0,
    tier,
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
  };

  if (!supabaseConfigured || !supabase) {
    // No Supabase project yet. Log and succeed so the funnel is testable.
    console.info("[apply] Supabase not configured, application not persisted.");
    console.info(`[apply] tier=${tier}`, row);
    return { status: "success" };
  }

  const { error } = await supabase.from("applications").insert(row);

  if (error) {
    console.error("[apply] insert failed", error);
    return {
      status: "error",
      message:
        "We couldn't save your application. Please try again in a moment, or email contact@accountingtalent.in.",
    };
  }

  // There is no email-address verification step: it was dropped rather than
  // deferred, so the application is live for review as soon as it is saved.
  // Instead we send a best-effort confirmation (not a verification) after the
  // response — it never blocks or fails the submission — and reachability is
  // confirmed later at Stage 2, where a bounced invite marks the address dead
  // (see the Resend bounce webhook). A bounced confirmation surfaces the same way.
  const applicantEmail = row.email;
  if (applicantEmail) {
    after(async () => {
      try {
        const result = await sendEmail(
          applicantEmail,
          emailApplicationReceived({ first_name: firstNameOf(row.full_name) }),
        );
        if (!result.ok) {
          console.error(
            `[apply] confirmation send failed to=${applicantEmail}: ${result.error}`,
          );
        }
      } catch (e) {
        console.error(
          `[apply] confirmation send failed to=${applicantEmail}`,
          e,
        );
      }
    });
  }

  return { status: "success" };
}

const firmEmail = z.email();
const websiteUrl = z.url();

/*
  The employer role brief (Section "Tell us who you need" on /employers). The
  page's primary conversion: a firm tells us the role, software, experience,
  schedule and budget, and we come back with a matched shortlist. Same shape and
  discipline as submitApplication (guards -> rate limit -> validate -> insert ->
  best-effort confirmation), writing to employer_leads. Reachable by direct POST
  like every Server Function, so it re-validates and never trusts the client.
*/
export type EmployerLeadInput = {
  full_name: string;
  work_email: string;
  firm_name: string;
  firm_website?: string;
  role: string;
  experience_required?: string;
  software?: string[];
  tax_forms?: string[];
  hours_overlap?: string;
  budget?: string;
  start_timeframe?: string;
  details?: string;
};

export async function submitEmployerLead(
  raw: EmployerLeadInput,
  utm: Utm = {},
  guard: Guard = {},
): Promise<ApplyState> {
  const ip = await clientIp();

  // The brief takes a minute or two to fill; a 3s floor is comfortably below any
  // human speed. Guards return the normal success shape without persisting.
  if (isLikelyBot({ hp: guard.hp, startedAt: guard.startedAt, minMs: 3000 })) {
    logDrop("employer_lead", "honeypot-or-timing", ip);
    return { status: "success" };
  }

  const rl = await isRateLimited("employer_lead", ip, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.limited) {
    logDrop("employer_lead", "rate_limit", rl.ipHash);
    return { status: "success" };
  }

  const clean = (v: string | undefined) => (v ?? "").trim();
  const full_name = clean(raw.full_name);
  const work_email = clean(raw.work_email).toLowerCase();
  const firm_name = clean(raw.firm_name);
  const firm_website = clean(raw.firm_website);
  const role = clean(raw.role);

  const errors: Record<string, string> = {};
  if (!full_name) errors.full_name = "Please tell us your name.";
  if (!firmEmail.safeParse(work_email).success) {
    errors.work_email = "Please enter a valid work email address.";
  }
  if (!firm_name) errors.firm_name = "Please tell us your firm's name.";
  if (!role) errors.role = "Please tell us which role you're hiring for.";
  // Website is optional, but if given it must look like a URL. Accept a bare
  // domain by prepending https:// before validating.
  const normalizedWebsite = firm_website
    ? firm_website.match(/^https?:\/\//i)
      ? firm_website
      : `https://${firm_website}`
    : "";
  if (normalizedWebsite && !websiteUrl.safeParse(normalizedWebsite).success) {
    errors.firm_website = "Please enter a valid website, or leave it blank.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "A few details need fixing before we can send this.",
      errors,
    };
  }

  const row = {
    full_name,
    work_email,
    firm_name,
    firm_website: normalizedWebsite || null,
    role,
    experience_required: clean(raw.experience_required) || null,
    software: raw.software ?? [],
    tax_forms: raw.tax_forms ?? [],
    hours_overlap: clean(raw.hours_overlap) || null,
    budget: clean(raw.budget) || null,
    start_timeframe: clean(raw.start_timeframe) || null,
    details: clean(raw.details) || null,
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
  };

  if (!supabaseConfigured || !supabase) {
    console.info("[employer-lead] Supabase not configured, brief not persisted.");
    console.info("[employer-lead]", row);
    return { status: "success" };
  }

  const { error } = await supabase.from("employer_leads").insert(row);
  if (error) {
    console.error("[employer-lead] insert failed", error);
    return {
      status: "error",
      message:
        "We couldn't send your brief just now. Please try again in a moment, or email contact@accountingtalent.in.",
    };
  }

  // Best-effort confirmation after the response; never blocks or fails the submit.
  after(async () => {
    try {
      const result = await sendEmail(
        work_email,
        emailEmployerLeadReceived({ firm_name }),
      );
      if (!result.ok) {
        console.error(
          `[employer-lead] confirmation send failed to=${work_email}: ${result.error}`,
        );
      }
    } catch (e) {
      console.error(
        `[employer-lead] confirmation send failed to=${work_email}`,
        e,
      );
    }
  });

  return { status: "success" };
}

/*
  A firm asking to be introduced to a verified candidate, from the profile page's
  "Request introduction" modal. AUTHORIZED: the caller must be a signed-in,
  VERIFIED employer with introduction capacity under their plan. Every rule is
  re-derived server-side (never trusted from the client): guards -> rate limit ->
  validate -> AUTHORIZE (viewer + entitlement limit) -> insert (with a DB partial
  unique index as the final backstop against duplicate active requests). Candidate
  contact details are never returned here; identity is released only when an
  introduction reaches `accepted`, and only to the associated employer account.
*/
export type IntroState = {
  status: "idle" | "success" | "error";
  message?: string;
  // Extra reasons the UI can act on without re-deriving anything.
  reason?: "unauthenticated" | "not_verified" | "at_limit" | "duplicate";
};

const applicationUuid = z.uuid();

export async function requestIntroduction(
  applicationId: string,
  message: string,
  guard: Guard = {},
): Promise<IntroState> {
  const ip = await clientIp();

  if (isLikelyBot({ hp: guard.hp, startedAt: guard.startedAt, minMs: 1200 })) {
    logDrop("introduction", "honeypot-or-timing", ip);
    return { status: "success" };
  }

  const rl = await isRateLimited("introduction", ip, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (rl.limited) {
    logDrop("introduction", "rate_limit", rl.ipHash);
    return { status: "success" };
  }

  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) {
    return {
      status: "error",
      message: "We couldn't identify that candidate. Please reopen the profile and try again.",
    };
  }
  const msg = String(message ?? "").trim().slice(0, 4000) || null;

  if (!supabaseConfigured || !supabase) {
    return { status: "error", message: "Introductions are temporarily unavailable." };
  }

  // --- Authorization (server-side, non-negotiable) ---------------------------
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.account) {
    return {
      status: "error",
      reason: "unauthenticated",
      message: "Please sign in with a verified employer account to request an introduction.",
    };
  }
  const accountId = viewer.account.id;
  const existing = await getViewerIntroduction(id, accountId);
  const { level } = deriveVisibility(viewer, existing);
  const entitlements = entitlementsFor(viewer.account);
  const activeCount = await countActiveIntroductions(accountId);

  const eligibility = canCreateIntroduction({ level, activeCount, entitlements });
  if (!eligibility.ok) {
    if (eligibility.reason === "not_verified") {
      return {
        status: "error",
        reason: "not_verified",
        message: "Verify your employer account to request introductions.",
      };
    }
    return {
      status: "error",
      reason: "at_limit",
      message:
        "You've reached your plan's active-introduction limit. Upgrade to request more, or wait for a current request to close.",
    };
  }

  const res = await insertIntroduction({
    applicationId: id,
    employerAccountId: accountId,
    createdBy: viewer.userId,
    message: msg,
    priority: entitlements.priority,
  });

  if (!res.ok) {
    if (res.reason === "duplicate") {
      return {
        status: "error",
        reason: "duplicate",
        message: "You already have an active request for this candidate.",
      };
    }
    return {
      status: "error",
      message:
        "We couldn't send your request just now. Please try again in a moment, or email contact@accountingtalent.in.",
    };
  }

  return { status: "success" };
}

/* Employer cancels their OWN active request. Ownership re-checked server-side. */
export async function cancelIntroduction(introductionId: string): Promise<IntroState> {
  const id = String(introductionId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid request." };
  if (!supabase) return { status: "error", message: "Unavailable." };

  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.account) {
    return { status: "error", reason: "unauthenticated", message: "Please sign in." };
  }
  const { data } = await supabase
    .from("introduction_requests")
    .select("id, application_id, employer_account_id, status, created_at")
    .eq("id", id)
    .maybeSingle();
  const row = data as
    | { id: string; employer_account_id: string | null; status: IntroductionStatus }
    | null;
  if (!row || row.employer_account_id !== viewer.account.id) {
    // Never confirm existence of a request that isn't the viewer's.
    return { status: "error", message: "Request not found." };
  }
  const result = await transitionIntroduction({
    introductionId: id,
    from: row.status,
    to: "cancelled",
    actorKind: "employer",
    actorUserId: viewer.userId,
  });
  if (!result.ok) return { status: "error", message: "That request can no longer be cancelled." };
  return { status: "success" };
}

/* Admin-only: drive an introduction through its lifecycle (review, invite,
   accept/decline on the candidate's behalf until candidate auth exists). */
export async function adminTransitionIntroduction(
  introductionId: string,
  to: IntroductionStatus,
): Promise<IntroState> {
  const id = String(introductionId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid request." };
  if (!supabase) return { status: "error", message: "Unavailable." };

  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isAdmin) {
    return { status: "error", message: "Not authorized." };
  }
  const { data } = await supabase
    .from("introduction_requests")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  const row = data as { id: string; status: IntroductionStatus } | null;
  if (!row) return { status: "error", message: "Request not found." };

  const result = await transitionIntroduction({
    introductionId: id,
    from: row.status,
    to,
    actorKind: "admin",
    actorUserId: viewer.userId,
  });
  if (!result.ok) {
    return { status: "error", message: `Cannot move ${row.status} -> ${to}.` };
  }
  await supabase.from("admin_actions").insert({
    action: "introduction_transition",
    detail: `${row.status} -> ${to}`,
    actor: viewer.email,
  });
  return { status: "success" };
}

/* Create the caller's employer account + owner membership (once). Signed-in only. */
export async function createEmployerAccount(name: string): Promise<IntroState> {
  if (!supabase) return { status: "error", message: "Unavailable." };
  const viewer = await getViewer();
  if (viewer.kind !== "user") {
    return { status: "error", reason: "unauthenticated", message: "Please sign in first." };
  }
  if (viewer.account) return { status: "success" }; // already has one

  // Mutual exclusivity: an account is either an employer OR a candidate, never
  // both. If this user owns a candidate application, block employer sign-up.
  const { data: owned } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", viewer.userId)
    .limit(1)
    .maybeSingle();
  if (owned) {
    return {
      status: "error",
      message:
        "This account is registered as a candidate, so it can't also be an employer. Please use a different email for employer access.",
    };
  }

  const firmName = String(name ?? "").trim().slice(0, 200);
  if (!firmName) return { status: "error", message: "Enter your firm name." };

  const { data, error } = await supabase
    .from("employer_accounts")
    .insert({ name: firmName })
    .select("id")
    .maybeSingle();
  if (error || !data) return { status: "error", message: "Could not create account." };

  const { error: memErr } = await supabase
    .from("employer_members")
    .insert({ employer_account_id: (data as { id: string }).id, user_id: viewer.userId, member_role: "owner" });
  if (memErr) return { status: "error", message: "Could not link account." };
  return { status: "success" };
}

/* Move the caller's employer account to `pending` verification. */
export async function requestEmployerVerification(): Promise<IntroState> {
  if (!supabase) return { status: "error", message: "Unavailable." };
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.account) {
    return { status: "error", reason: "unauthenticated", message: "Please sign in." };
  }
  if (viewer.account.verificationState === "verified") return { status: "success" };
  const { error } = await supabase
    .from("employer_accounts")
    .update({ verification_state: "pending" })
    .eq("id", viewer.account.id);
  if (error) return { status: "error", message: "Could not start verification." };
  return { status: "success" };
}

/* Admin-only test control: switch an employer account between free and paid.
   Not a billing workflow — for exercising entitlements locally. */
export async function adminSetEmployerPlan(
  employerAccountId: string,
  plan: "free" | "paid",
): Promise<IntroState> {
  if (!supabase) return { status: "error", message: "Unavailable." };
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isAdmin) return { status: "error", message: "Not authorized." };
  if (plan !== "free" && plan !== "paid") return { status: "error", message: "Invalid plan." };

  const { error } = await supabase
    .from("employer_accounts")
    .update({ plan, plan_updated_at: new Date().toISOString() })
    .eq("id", String(employerAccountId));
  if (error) return { status: "error", message: "Update failed." };

  await supabase.from("admin_actions").insert({
    action: "employer_plan_set",
    detail: `account=${employerAccountId} plan=${plan}`,
    actor: viewer.email,
  });
  return { status: "success" };
}

/* Save / unsave a candidate to the employer's shortlist. Verified employers only;
   scoped to the viewer's account; the DB unique index prevents duplicates. */
export type SaveState = { status: "success" | "error"; saved?: boolean; reason?: "unauthenticated" | "not_verified"; message?: string };

async function requireVerifiedEmployer(): Promise<
  { ok: true; accountId: string; userId: string } | { ok: false; res: SaveState }
> {
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.account) {
    return { ok: false, res: { status: "error", reason: "unauthenticated", message: "Sign in with an employer account." } };
  }
  if (viewer.account.verificationState !== "verified") {
    return { ok: false, res: { status: "error", reason: "not_verified", message: "Verify your employer account to save candidates." } };
  }
  return { ok: true, accountId: viewer.account.id, userId: viewer.userId };
}

export async function saveCandidate(applicationId: string): Promise<SaveState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  const gate = await requireVerifiedEmployer();
  if (!gate.ok) return gate.res;

  const { error } = await supabase
    .from("saved_candidates")
    .insert({ employer_account_id: gate.accountId, application_id: id, created_by: gate.userId });
  // 23505 = already saved; treat as success (idempotent, no duplicate row).
  if (error && error.code !== "23505") return { status: "error", message: "Could not save." };
  return { status: "success", saved: true };
}

export async function unsaveCandidate(applicationId: string): Promise<SaveState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  const gate = await requireVerifiedEmployer();
  if (!gate.ok) return gate.res;

  const { error } = await supabase
    .from("saved_candidates")
    .delete()
    .eq("employer_account_id", gate.accountId)
    .eq("application_id", id);
  if (error) return { status: "error", message: "Could not update." };
  return { status: "success", saved: false };
}

/* Admin-only: reconfirm a candidate's availability (stamps now). Stamps the
   structured-availability confirmation — the single source of truth the profile
   mapper, readiness panel and publication gate all read (equivalent to
   adminConfirmField(id, "availability")). */
export async function adminReconfirmAvailability(applicationId: string): Promise<IntroState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isAdmin) return { status: "error", message: "Not authorized." };

  const { error } = await supabase
    .from("applications")
    .update({ availability_structured_confirmed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { status: "error", message: "Update failed." };
  await supabase.from("admin_actions").insert({
    action: "availability_reconfirmed",
    application_id: id,
    actor: viewer.email,
  });
  return { status: "success" };
}

/* --- Profile readiness (admin) ------------------------------------------------
   The admin readiness panel drives three narrow actions. None of them edit
   applicant content — they only record confirmations and checks (stamping a
   timestamp) and move the publication status. Publication itself is gated
   server-side by publicationRequirements(): the minimum data + AT checks must be
   present, so an admin can never publish an incomplete profile from the UI. */

const PROFILE_STATUSES = [
  "draft",
  "needs_candidate_confirmation",
  "under_assessment",
  "approved",
  "published",
  "paused",
] as const;

// A confirmable field key → the *_confirmed_at column it stamps. These are
// candidate-provided confirmations, not AccountingTalent verifications.
const CONFIRM_COLUMNS: Record<string, string> = {
  role: "role_confirmed_at",
  experience: "experience_confirmed_at",
  compensation_basis: "compensation_basis_confirmed_at",
  availability: "availability_structured_confirmed_at",
  software: "software_confirmed_at",
  education: "education_confirmed_at",
  candidate_publication: "candidate_publication_approved_at",
};

// An AccountingTalent check → the *_verified/assessed_at column it stamps.
const CHECK_COLUMNS: Record<string, string> = {
  identity: "identity_verified_at",
  english: "english_assessed_at",
  qualification: "qualification_verified_at",
};

async function requireAdmin(): Promise<
  { ok: true; email: string | null } | { ok: false; res: IntroState }
> {
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isAdmin) {
    return { ok: false, res: { status: "error", message: "Not authorized." } };
  }
  return { ok: true, email: viewer.email };
}

/* Move a profile between readiness states. Publishing is blocked unless the
   publication requirements are met (checked against the live row). */
export async function adminSetProfileStatus(
  applicationId: string,
  status: string,
): Promise<IntroState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  if (!(PROFILE_STATUSES as readonly string[]).includes(status)) {
    return { status: "error", message: "Invalid status." };
  }
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  if (status === "published") {
    const { data: row } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
    if (!row) return { status: "error", message: "Candidate not found." };
    const req = publicationRequirements(row as ReadinessRow);
    if (!req.met) {
      return { status: "error", message: `Cannot publish — missing: ${req.missing.join(", ")}` };
    }
  }

  const { error } = await supabase
    .from("applications")
    .update({ profile_status: status })
    .eq("id", id);
  if (error) return { status: "error", message: "Update failed." };
  await supabase.from("admin_actions").insert({
    action: "profile_status_set",
    application_id: id,
    detail: `status=${status}`,
    actor: gate.email,
  });
  return { status: "success" };
}

/* Toggle a candidate-provided confirmation (stamps now, or clears it). */
export async function adminConfirmField(
  applicationId: string,
  key: string,
  confirmed: boolean = true,
): Promise<IntroState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  const column = CONFIRM_COLUMNS[key];
  if (!column) return { status: "error", message: "Unknown field." };
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const { error } = await supabase
    .from("applications")
    .update({ [column]: confirmed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { status: "error", message: "Update failed." };
  await supabase.from("admin_actions").insert({
    action: "profile_field_confirmed",
    application_id: id,
    detail: `field=${key} confirmed=${confirmed}`,
    actor: gate.email,
  });
  return { status: "success" };
}

/* Record an AccountingTalent check (identity / English / qualification). English
   also carries the assessed level. Stamps now, or clears the check. */
export async function adminVerifyCheck(
  applicationId: string,
  check: string,
  opts: { confirmed?: boolean; englishLevel?: string } = {},
): Promise<IntroState> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { status: "error", message: "Invalid candidate." };
  if (!supabase) return { status: "error", message: "Unavailable." };
  const column = CHECK_COLUMNS[check];
  if (!column) return { status: "error", message: "Unknown check." };
  const gate = await requireAdmin();
  if (!gate.ok) return gate.res;

  const confirmed = opts.confirmed ?? true;
  const patch: Record<string, unknown> = { [column]: confirmed ? new Date().toISOString() : null };
  if (check === "english" && confirmed && opts.englishLevel) patch.english_level = opts.englishLevel;

  const { error } = await supabase.from("applications").update(patch).eq("id", id);
  if (error) return { status: "error", message: "Update failed." };
  await supabase.from("admin_actions").insert({
    action: "profile_check_recorded",
    application_id: id,
    detail: `check=${check} confirmed=${confirmed}`,
    actor: gate.email,
  });
  return { status: "success" };
}

/* --- Candidate self-service (owner-scoped) ------------------------------------
   The candidate dashboard (/candidates/me) lets a candidate provide + confirm
   THEIR OWN candidate-provided data. Every action re-authorizes ownership from
   scratch (isApplicationOwner against applications.user_id) and only ever writes
   candidate-provided fields + the candidate-confirmation timestamps the readiness
   model already reads. Candidates can NEVER set AccountingTalent verification
   checks (identity/English/qualification), the publication status, or make a photo
   public — those are admin-only / non-existent by design. Audited via admin_actions
   with the candidate's email as actor. */

export type OwnerActionState = { status: "success" | "error"; message?: string };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

async function requireOwner(
  applicationId: string,
): Promise<{ ok: true; id: string; actor: string | null } | { ok: false; res: OwnerActionState }> {
  const id = String(applicationId ?? "").trim();
  if (!applicationUuid.safeParse(id).success) return { ok: false, res: { status: "error", message: "Invalid profile." } };
  if (!supabase) return { ok: false, res: { status: "error", message: "Unavailable." } };
  const viewer = await getViewer();
  if (viewer.kind !== "user") return { ok: false, res: { status: "error", message: "Sign in to edit your profile." } };
  const { data } = await supabase.from("applications").select("user_id").eq("id", id).maybeSingle();
  if (!isApplicationOwner(viewer, data as { user_id?: string | null } | null)) {
    return { ok: false, res: { status: "error", message: "Not authorized." } };
  }
  return { ok: true, id, actor: viewer.email };
}

async function ownerUpdate(
  id: string,
  actor: string | null,
  patch: Record<string, unknown>,
  action: string,
): Promise<OwnerActionState> {
  const { error } = await supabase!.from("applications").update(patch).eq("id", id);
  if (error) return { status: "error", message: "Could not save." };
  await supabase!.from("admin_actions").insert({ action, application_id: id, actor, detail: "candidate self-service" });
  return { status: "success" };
}

const availabilitySchema = z.object({
  // Confirming availability REQUIRES the full set — a "Confirmed" badge must mean
  // an employer sees complete, real availability, never a partial guess.
  days: z.array(z.enum(DAYS)).min(1, "Select at least one available day").max(7),
  startTime: z.string().regex(HHMM, "Enter a preferred start time"),
  finishTime: z.string().regex(HHMM, "Enter a preferred finish time"),
  timezone: z.string().trim().min(1, "Select your timezone").max(64),
  maxHours: z.number({ error: "Enter your max hours per week" }).int().min(1).max(80),
  busySeasonFlexible: z.boolean().optional(),
});

/* Candidate confirms their structured availability. Stamps
   availability_structured_confirmed_at (unlocks the confirmed-availability display
   + ET-overlap calc). */
export async function candidateConfirmAvailability(
  applicationId: string,
  input: z.infer<typeof availabilitySchema>,
): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the availability details." };
  }
  const v = parsed.data;
  const patch: Record<string, unknown> = {
    availability_structured_confirmed_at: new Date().toISOString(),
    avail_days: v.days,
    avail_start_time: v.startTime,
    avail_finish_time: v.finishTime,
    timezone: v.timezone,
    avail_max_weekly_hours: v.maxHours,
  };
  if (v.busySeasonFlexible != null) patch.avail_busy_season_flexible = v.busySeasonFlexible;
  return ownerUpdate(gate.id, gate.actor, patch, "candidate_availability_confirmed");
}

const softwareSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(80),
    // Level + years are REQUIRED per product — an empty depth reads as unconfirmed.
    // Last used stays optional.
    level: z.enum(["Basic", "Intermediate", "Advanced", "Expert"], {
      error: "Choose a level for each product",
    }),
    years: z.number({ error: "Enter years for each product" }).int().min(0).max(50),
    last_used: z.string().trim().max(20).optional(),
  }),
).max(20);

/* Candidate sets their software list + optional depth (level/years/last used).
   Marks each candidate-confirmed and stamps software_confirmed_at. */
export async function candidateSetSoftwareDepth(
  applicationId: string,
  items: z.infer<typeof softwareSchema>,
): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;
  const parsed = softwareSchema.safeParse(items);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the software details." };
  }
  const software_proficiency = parsed.data.map((s) => ({ ...s, confirmed_by_candidate: true }));
  return ownerUpdate(
    gate.id,
    gate.actor,
    { software_proficiency, software_confirmed_at: new Date().toISOString() },
    "candidate_software_confirmed",
  );
}

const educationSchema = z.array(
  z.object({
    degree: z.string().trim().min(1).max(120),
    field_of_study: z.string().trim().max(120).optional(),
    institution: z.string().trim().max(160).optional(),
    year: z.union([z.string().trim().max(10), z.number()]).optional(),
    completion_status: z.enum(["Completed", "In progress"]).optional(),
  }),
).max(10);

/* Candidate provides/confirms their education. Stamps education_confirmed_at. */
export async function candidateConfirmEducation(
  applicationId: string,
  items: z.infer<typeof educationSchema>,
): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;
  const parsed = educationSchema.safeParse(items);
  if (!parsed.success) return { status: "error", message: "Please check the education details." };
  return ownerUpdate(
    gate.id,
    gate.actor,
    { education: parsed.data, education_confirmed_at: new Date().toISOString() },
    "candidate_education_confirmed",
  );
}

/* Candidate confirms the compensation basis (the up-to-N-hours/week framing). */
export async function candidateConfirmCompensationBasis(applicationId: string): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;
  return ownerUpdate(
    gate.id,
    gate.actor,
    { compensation_basis_confirmed_at: new Date().toISOString() },
    "candidate_compensation_basis_confirmed",
  );
}

/* Candidate approves their profile copy for publication. Publication itself stays
   admin+publicationRequirements-gated; this only records the candidate's approval. */
export async function candidateApprovePublication(applicationId: string): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;
  return ownerUpdate(
    gate.id,
    gate.actor,
    { candidate_publication_approved_at: new Date().toISOString() },
    "candidate_publication_approved",
  );
}

const PHOTO_BUCKET = "candidate-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
// "<id>.jpg" -> "<id>-frosted.jpg": must match the photo route's frostedObjectKey.
const frostedKeyOf = (key: string) => key.replace(/(\.[^./]+)$/, "-frosted$1");

/* Candidate uploads or replaces their OWN profile photo. Not review-gated — it goes
   live immediately, but visibility is unchanged: the CLEAR photo only ever reaches
   the candidate, AccountingTalent, and an employer with an accepted introduction;
   verified employers get a downscaled+blurred derivative until then; the public
   never sees it (see app/api/candidates/[id]/photo). Rate-limited per candidate.
   The image is re-encoded server-side, which strips EXIF (incl. any GPS) and caps
   dimensions, and the blurred derivative is regenerated so the two never diverge. */
export async function candidateUploadPhoto(
  applicationId: string,
  formData: FormData,
): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;

  const rl = await isRateLimited("candidate_photo", gate.id, { limit: 6, windowMs: 10 * 60_000 });
  if (rl.limited) {
    return { status: "error", message: "You've updated your photo a few times just now — please wait a few minutes and try again." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a photo to upload." };
  if (file.size > MAX_PHOTO_BYTES) return { status: "error", message: "That image is too large — please use one under 5 MB." };
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) return { status: "error", message: "Please upload a PNG, JPEG, or WebP image." };

  const input = Buffer.from(await file.arrayBuffer());

  // Lazy-load sharp so the native module isn't pulled in for every other action.
  const sharp = (await import("sharp")).default;
  let clear: Buffer;
  let frosted: Buffer;
  try {
    // rotate() applies EXIF orientation then metadata is dropped (default), so no
    // location data survives. Frosted = hard downscale THEN blur, so the stored
    // bytes carry no recoverable facial detail (not a CSS-only blur).
    clear = await sharp(input).rotate().resize(1000, 1000, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    frosted = await sharp(input).rotate().resize(40).blur(6).jpeg({ quality: 70 }).toBuffer();
  } catch {
    return { status: "error", message: "That file doesn't look like a valid image — please try another." };
  }

  // Fetch the previous key so a legacy object under a different extension (the ops
  // script stored .png) can be cleaned up rather than orphaned.
  const { data: prev } = await supabase!.from("applications").select("photo_url").eq("id", gate.id).maybeSingle();
  const prevKey = String((prev as { photo_url?: string | null } | null)?.photo_url ?? "");

  const key = `${gate.id}.jpg`;
  const frostedKey = frostedKeyOf(key);

  const up1 = await supabase!.storage.from(PHOTO_BUCKET).upload(key, clear, { contentType: "image/jpeg", upsert: true });
  if (up1.error) return { status: "error", message: "Upload failed — please try again." };
  const up2 = await supabase!.storage.from(PHOTO_BUCKET).upload(frostedKey, frosted, { contentType: "image/jpeg", upsert: true });
  if (up2.error) return { status: "error", message: "Upload failed — please try again." };

  // Best-effort: remove a superseded object pair whose key differs from the new one.
  if (prevKey && prevKey !== key && !/^https?:\/\//i.test(prevKey) && !prevKey.startsWith("/")) {
    await supabase!.storage.from(PHOTO_BUCKET).remove([prevKey, frostedKeyOf(prevKey)]);
  }

  return ownerUpdate(gate.id, gate.actor, { photo_url: key }, "candidate_photo_uploaded");
}

/* Candidate removes their OWN profile photo — deletes the stored clear + frosted
   objects and clears photo_url. Idempotent (no-op if there's nothing to remove).
   A legacy absolute-URL photo can't be deleted from our bucket, so we just clear
   the column. */
export async function candidateRemovePhoto(applicationId: string): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;

  const { data: row } = await supabase!.from("applications").select("photo_url").eq("id", gate.id).maybeSingle();
  const key = String((row as { photo_url?: string | null } | null)?.photo_url ?? "");
  if (key && !/^https?:\/\//i.test(key) && !key.startsWith("/")) {
    await supabase!.storage.from(PHOTO_BUCKET).remove([key, frostedKeyOf(key)]);
  }

  return ownerUpdate(gate.id, gate.actor, { photo_url: null }, "candidate_photo_removed");
}

// Statuses in which AccountingTalent has completed its review, so the candidate is
// allowed to flip their own live listing (published <-> paused) themselves.
const CANDIDATE_TOGGLEABLE_STATUSES = new Set(["approved", "published", "paused"]);

/* Candidate flips their OWN live listing between published and paused. Only once AT
   has approved the profile (status in CANDIDATE_TOGGLEABLE_STATUSES) — never from a
   draft/under-review state, so a candidate can't self-publish ahead of AT. Going
   live re-checks the SAME publicationRequirements the admin publish path enforces,
   so a toggle can never expose an incomplete profile. */
export async function candidateSetPublished(
  applicationId: string,
  published: boolean,
): Promise<OwnerActionState> {
  const gate = await requireOwner(applicationId);
  if (!gate.ok) return gate.res;

  const { data: row } = await supabase!.from("applications").select("*").eq("id", gate.id).maybeSingle();
  if (!row) return { status: "error", message: "Profile not found." };

  const current = String((row as ReadinessRow).profile_status ?? "draft");
  if (!CANDIDATE_TOGGLEABLE_STATUSES.has(current)) {
    return { status: "error", message: "AccountingTalent is still reviewing your profile — you can publish once it's approved." };
  }

  if (published) {
    const req = publicationRequirements(row as ReadinessRow);
    if (!req.met) {
      return { status: "error", message: `Can't publish yet — still needed: ${req.missing.join(", ")}.` };
    }
  }

  return ownerUpdate(
    gate.id,
    gate.actor,
    { profile_status: published ? "published" : "paused" },
    published ? "candidate_published" : "candidate_unpublished",
  );
}

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message?: string;
  // The normalized email, returned on a real success so the client can drive the
  // post-submit concierge step (saveFirmConcierge keys on it). Absent on the
  // silent-success guard paths, which is fine: those never reach the concierge.
  email?: string;
};

export async function joinFirmWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Guards first, every hit a silent success. Honeypot + timing are free; the
  // rate limit is the DB round trip, so it runs second. The floor stays low
  // (800ms) because a person with a saved email can legitimately submit this
  // one-field form fast.
  const ip = await clientIp();
  const startedAtRaw = formData.get("ts");
  const startedAt = startedAtRaw ? Number(startedAtRaw) : undefined;

  if (
    isLikelyBot({
      hp: formData.get("company_website")?.toString(),
      startedAt,
      minMs: 800,
    })
  ) {
    logDrop("waitlist", "honeypot-or-timing", ip);
    return { status: "success" };
  }

  const rl = await isRateLimited("waitlist", ip, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.limited) {
    logDrop("waitlist", "rate_limit", rl.ipHash);
    return { status: "success" };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!firmEmail.safeParse(email).success) {
    return {
      status: "error",
      message: "Please enter a valid work email address.",
    };
  }

  if (!supabaseConfigured || !supabase) {
    console.info("[waitlist] Supabase not configured. Email:", email);
    return { status: "success", email };
  }

  const { error } = await supabase
    .from("firm_waitlist")
    .upsert({ email }, { onConflict: "email" });

  if (error) {
    console.error("[waitlist] insert failed", error);
    return {
      status: "error",
      message: "We couldn't add you just now. Please try again in a moment.",
    };
  }

  return { status: "success", email };
}

/*
  Section 2 concierge: the two single-select answers a firm can give right after
  joining (which role they'd hire first, and when). Each tap calls this to
  persist that one field. Keyed on the email the join step already stored, which
  the client holds from the joinFirmWaitlist success. Both answers are optional.

  Reachable by direct POST like every Server Function, so it re-validates: the
  email must parse, and role/timing must be one of the offered options (anything
  else is dropped, not stored). Rate limited on its own bucket. It updates by
  email, so it never inserts, a call for an email not on the list is a silent
  no-op. That, plus low-sensitivity fields (a role and a timing, no PII), is why
  keying on the client-held email is acceptable here.
*/
const ROLE_OPTIONS = firms.founding.concierge.roleOptions as readonly string[];
const TIMING_OPTIONS = firms.founding.concierge
  .timingOptions as readonly string[];

export type ConciergeInput = {
  email: string;
  role?: string;
  timing?: string;
};

export async function saveFirmConcierge(
  input: ConciergeInput,
): Promise<{ ok: boolean }> {
  // Silent throttle, generous because two legitimate taps are two calls.
  const ip = await clientIp();
  const rl = await isRateLimited("concierge", ip, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.limited) {
    logDrop("concierge", "rate_limit", rl.ipHash);
    return { ok: true };
  }

  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();
  if (!firmEmail.safeParse(email).success) return { ok: false };

  const update: { first_role?: string; hire_timing?: string } = {};
  if (input.role && ROLE_OPTIONS.includes(input.role)) {
    update.first_role = input.role;
  }
  if (input.timing && TIMING_OPTIONS.includes(input.timing)) {
    update.hire_timing = input.timing;
  }
  if (Object.keys(update).length === 0) return { ok: false };

  if (!supabaseConfigured || !supabase) {
    console.info("[concierge] (no db)", email, JSON.stringify(update));
    return { ok: true };
  }

  const { error } = await supabase
    .from("firm_waitlist")
    .update(update)
    .eq("email", email);

  if (error) {
    console.error("[concierge] update failed", error);
    return { ok: false };
  }

  return { ok: true };
}
