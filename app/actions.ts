"use server";

import { z } from "zod";
import type { Answers } from "@/content/form";
import { stateForCity } from "@/content/cities";
import { validateAll, visibleQuestions } from "@/lib/validate";
import { scoreApplication } from "@/lib/scoring";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/*
  Server Functions are reachable by direct POST, not just through our UI, so
  everything here re-validates from scratch and never trusts the client.
*/

export type ApplyState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

type Utm = { source?: string; medium?: string; campaign?: string };

export async function submitApplication(
  raw: Answers,
  utm: Utm = {},
): Promise<ApplyState> {
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
