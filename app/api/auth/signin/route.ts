import { after } from "next/server";
import { supabase } from "@/lib/supabase";
import { isRateLimited } from "@/lib/ratelimit";
import { normalizeEmail } from "@/lib/authz/email";
import { isKnownAccount, safeNext } from "@/lib/auth/accounts";
import { isAllowedToSignIn } from "@/lib/auth/allowlist";
import { createLinkToken } from "@/lib/auth/linkToken";
import { emailNoAccount, emailSignInLink } from "@/lib/auth/emails";
import { sendEmail } from "@/lib/email";

/*
  Sends the sign-in link. This route exists because the browser cannot be trusted
  with any of the three things the sign-in page promises: that an unknown address
  is indistinguishable from a known one, that the link dies in 15 minutes, and
  that resending is throttled.

  THE INVARIANT: every request that reaches this handler gets the same response.
  Same status, same body, same duration — whether the address has an account, has
  no account, is malformed, or has been asking too often. The only thing that
  varies is which email goes out, and that lands in an inbox the caller must
  already control.

  Timing parity is structural, not approximate: NOTHING that depends on whether
  the account exists happens before the response. The lookup, the link generation
  and the send are all deferred with after(), so the handler cannot leak through
  its own duration. Anything added below the after() boundary is free to branch;
  anything added above it must behave identically for every address.

  Account creation is deliberately NOT here. generateLink creates the auth user
  when one does not exist, so it is only ever called for an address that already
  has an account (see isKnownAccount). Otherwise this form would be an open
  signup endpoint.
*/

// Everything above the after() boundary is branch-independent, so this floor is
// no longer load-bearing for enumeration. It stays to flatten the remaining
// jitter and to stop a malformed address returning noticeably sooner than a
// well-formed one.
const MIN_DURATION_MS = 700;

// Deliberately loose: this only rejects what could not possibly be an address.
// Anything stricter starts rejecting real ones.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function siteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

async function settle(startedAt: number): Promise<Response> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_DURATION_MS) {
    await new Promise((r) => setTimeout(r, MIN_DURATION_MS - elapsed));
  }
  return Response.json({ ok: true });
}

/*
  Runs after the response has gone out. Every failure here is logged and
  swallowed: the caller has already been told "ok", and telling them anything
  else would be the leak this route exists to prevent.
*/
async function deliver(email: string, next: string | null, origin: string): Promise<void> {
  try {
    // Two gates, one outcome. The allowlist is the stage restriction (only the
    // operators and Sai for now); the account check is the permanent rule. A
    // failure of either sends the same email, so neither reveals which applied.
    if (!isAllowedToSignIn(email) || !(await isKnownAccount(email))) {
      await sendEmail(email, emailNoAccount());
      return;
    }

    if (!supabase) return;

    // Generates the token and sends nothing, which is the whole point: it lets
    // us mail our own wording. The returned action_link is ignored — we build
    // the callback URL ourselves, so Supabase's redirect allowlist never has to
    // know about this deployment.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const hashedToken = data?.properties?.hashed_token;
    if (error || !hashedToken) {
      console.error("[signin] generateLink failed", error?.message ?? "no hashed_token");
      return;
    }

    const params = new URLSearchParams({ t: createLinkToken(hashedToken) });
    if (next) params.set("next", next);

    const sent = await sendEmail(email, emailSignInLink({ link: `${origin}/auth/callback?${params}` }));
    if (!sent.ok) console.error("[signin] send failed", sent.error);
  } catch (e) {
    console.error("[signin] deliver threw", e);
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  let email = "";
  let next: string | null = null;
  try {
    const body = (await request.json()) as { email?: unknown; next?: unknown };
    email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    next = safeNext(typeof body.next === "string" ? body.next : null);
  } catch {
    return settle(startedAt);
  }

  if (!EMAIL_RE.test(email)) return settle(startedAt);

  // Three limits, all of which fail into the same silent success. The per-email
  // 30 seconds is the server's copy of the resend countdown on the page — the
  // countdown is a courtesy, this is the rule.
  const ip = clientIp(request);
  const limited =
    (await isRateLimited("signin", ip, { limit: 10, windowMs: 10 * 60_000 })).limited ||
    (await isRateLimited("signin", `email:${email}`, { limit: 1, windowMs: 30_000 })).limited ||
    (await isRateLimited("signin", `email-hour:${email}`, { limit: 6, windowMs: 60 * 60_000 })).limited;

  if (!limited) {
    const origin = siteUrl(request);
    after(() => deliver(email, next, origin));
  }

  return settle(startedAt);
}
