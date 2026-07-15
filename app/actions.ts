"use server";

import { headers } from "next/headers";
import { z } from "zod";
import type { Answers } from "@/content/form";
import { stateForCity } from "@/content/cities";
import { validateAll, visibleQuestions } from "@/lib/validate";
import { scoreApplication } from "@/lib/scoring";
import { isLikelyBot } from "@/lib/antispam";
import { isRateLimited } from "@/lib/ratelimit";
import { supabase, supabaseConfigured } from "@/lib/supabase";

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

  // TODO: send the verification email (Resend or Postmark) once Stage 2 ships.
  return { status: "success" };
}

const firmEmail = z.email();

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message?: string;
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
    return { status: "success" };
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

  return { status: "success" };
}
