import "server-only";

/*
  Thin DB layer for introductions (service-role). All decisions live in the pure
  introductions.ts; this only performs the reads/writes and records history. Every
  status change writes an introduction_events row and uses an optimistic
  `.eq("status", from)` guard so concurrent transitions can't both win.
*/
import { supabase } from "@/lib/supabase";
import { ACTIVE_INTRO_STATUSES, validateTransition } from "./introductions";
import type { Introduction, IntroductionStatus } from "./types";

type Row = {
  id: string;
  application_id: string;
  employer_account_id: string | null;
  status: IntroductionStatus;
  created_at: string;
};

function mapIntro(r: Row): Introduction {
  return {
    id: r.id,
    applicationId: r.application_id,
    employerAccountId: r.employer_account_id,
    status: r.status,
    createdAt: r.created_at,
  };
}

const TERMINAL: ReadonlySet<IntroductionStatus> = new Set([
  "accepted",
  "declined",
  "cancelled",
  "expired",
]);

/** The viewer's OWN latest introduction for a candidate (scoped to their account
 *  so it can never surface another employer's request). */
export async function getViewerIntroduction(
  applicationId: string,
  employerAccountId: string | null,
): Promise<Introduction | null> {
  if (!supabase || !employerAccountId) return null;
  const { data } = await supabase
    .from("introduction_requests")
    .select("id, application_id, employer_account_id, status, created_at")
    .eq("application_id", applicationId)
    .eq("employer_account_id", employerAccountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapIntro(data as Row) : null;
}

export async function countActiveIntroductions(employerAccountId: string): Promise<number> {
  if (!supabase) return 0;
  const { count } = await supabase
    .from("introduction_requests")
    .select("id", { count: "exact", head: true })
    .eq("employer_account_id", employerAccountId)
    .in("status", ACTIVE_INTRO_STATUSES as unknown as string[]);
  return count ?? 0;
}

/** In-progress introductions for a CANDIDATE, across all employers (by application).
 *  Drives the dashboard's "you have N introductions in progress" unpublish confirm. */
export async function countActiveIntroductionsForCandidate(applicationId: string): Promise<number> {
  if (!supabase) return 0;
  const { count } = await supabase
    .from("introduction_requests")
    .select("id", { count: "exact", head: true })
    .eq("application_id", applicationId)
    .in("status", ACTIVE_INTRO_STATUSES as unknown as string[]);
  return count ?? 0;
}

async function writeEvent(
  introductionId: string,
  from: IntroductionStatus | null,
  to: IntroductionStatus,
  actorKind: "employer" | "admin" | "candidate" | "system",
  actorUserId: string | null,
  note?: string,
): Promise<void> {
  if (!supabase) return;
  await supabase.from("introduction_events").insert({
    introduction_id: introductionId,
    from_status: from,
    to_status: to,
    actor_kind: actorKind,
    actor_user_id: actorUserId,
    note: note ?? null,
  });
}

export type InsertResult =
  | { ok: true; id: string }
  | { ok: false; reason: "duplicate" | "error" };

export async function insertIntroduction(args: {
  applicationId: string;
  employerAccountId: string;
  createdBy: string;
  message: string | null;
  priority: boolean;
}): Promise<InsertResult> {
  if (!supabase) return { ok: false, reason: "error" };
  const { data, error } = await supabase
    .from("introduction_requests")
    .insert({
      application_id: args.applicationId,
      employer_account_id: args.employerAccountId,
      created_by: args.createdBy,
      message: args.message,
      priority: args.priority,
      status: "requested",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    // 23505 = unique_violation from the active-request partial index.
    if (error.code === "23505") return { ok: false, reason: "duplicate" };
    return { ok: false, reason: "error" };
  }
  const id = (data as { id: string }).id;
  await writeEvent(id, null, "requested", "employer", args.createdBy);
  return { ok: true, id };
}

export type TransitionResult =
  | { ok: true }
  | { ok: false; reason: "invalid_transition" | "not_found" | "error" };

/** Validated status change with optimistic concurrency + history. */
export async function transitionIntroduction(args: {
  introductionId: string;
  from: IntroductionStatus;
  to: IntroductionStatus;
  actorKind: "employer" | "admin" | "candidate" | "system";
  actorUserId: string | null;
  note?: string;
}): Promise<TransitionResult> {
  if (!validateTransition(args.from, args.to)) return { ok: false, reason: "invalid_transition" };
  if (!supabase) return { ok: false, reason: "error" };

  const patch: Record<string, unknown> = { status: args.to };
  if (TERMINAL.has(args.to)) patch.decided_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("introduction_requests")
    .update(patch)
    .eq("id", args.introductionId)
    .eq("status", args.from) // optimistic guard
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, reason: "error" };
  if (!data) return { ok: false, reason: "not_found" };

  await writeEvent(args.introductionId, args.from, args.to, args.actorKind, args.actorUserId, args.note);
  return { ok: true };
}
