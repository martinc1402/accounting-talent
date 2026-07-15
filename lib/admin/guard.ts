import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { isRateLimited } from "@/lib/ratelimit";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/*
  Gate for the internal admin routes (invite / result). Not linked anywhere,
  robots-disallowed, and hardened so it doesn't even admit to existing:

  - Every unauthorized outcome returns 404, never 401/403 — a scanner without
    the secret sees the same thing as a nonexistent route.
  - The bearer is compared in constant time (sha256 both sides, then
    timingSafeEqual) so neither the value nor the length leaks via timing.
  - Rate limited hard and BEFORE the secret check, so the endpoint can't be used
    to brute-force the secret, and a throttled caller also just gets a 404.
  - ADMIN_TASK_SECRET is server-only, set in Vercel env, never NEXT_PUBLIC.
*/

const secret = process.env.ADMIN_TASK_SECRET;

const notFound = () =>
  new Response("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain" },
  });

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function tokenMatches(provided: string): boolean {
  if (!secret) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** Returns null when the caller is authorized; otherwise a 404 Response the
 *  route should return immediately. */
export async function requireAdmin(request: Request): Promise<Response | null> {
  // Throttle first, so this can't become a secret oracle. 10/min per IP.
  const rl = await isRateLimited("admin", clientIp(request), {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rl.limited) return notFound();

  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!bearer || !tokenMatches(bearer)) return notFound();

  return null;
}

export async function logAdminAction(entry: {
  action: string;
  application_id?: string | null;
  assessment_id?: string | null;
  outcome: string;
  detail?: string | null;
  actor?: string;
}): Promise<void> {
  if (!supabaseConfigured || !supabase) {
    console.info("[admin] (no db) action:", JSON.stringify(entry));
    return;
  }
  const { error } = await supabase.from("admin_actions").insert({
    action: entry.action,
    application_id: entry.application_id ?? null,
    assessment_id: entry.assessment_id ?? null,
    outcome: entry.outcome,
    detail: entry.detail ?? null,
    actor: entry.actor ?? "admin-route",
  });
  if (error) console.error("[admin] failed to log action", error.message);
}
