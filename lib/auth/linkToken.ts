import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/*
  A 15-minute wrapper around a Supabase magic-link token.

  Supabase's own OTP lifetime is a single project-level setting (default one
  hour) and cannot be set per link, so the 15 minutes the sign-in page promises
  is enforced here instead — in code, in this repo, where it can be read and
  tested. The wrapper carries an expiry and is signed, so a caller can neither
  extend the deadline nor forge a token hash.

  The wrapper is only a deadline. Single use still comes from Supabase: verifyOtp
  consumes the inner token on first redemption, and this layer adds no way back
  to a spent one.

  The signing key is AUTH_LINK_SECRET when set, falling back to the service-role
  key — already a server-only high-entropy secret, so this works with no new
  environment variable. Rotating either one invalidates outstanding links, which
  is the correct behaviour for a 15-minute token.
*/

const TTL_MS = 15 * 60 * 1000;

type Payload = { h: string; x: number };

function key(): string {
  const k = process.env.AUTH_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("No signing key: set AUTH_LINK_SECRET or SUPABASE_SERVICE_ROLE_KEY.");
  return k;
}

const b64url = (b: Buffer): string => b.toString("base64url");

function sign(payload: string): string {
  return b64url(createHmac("sha256", key()).update(payload).digest());
}

/** Wraps a Supabase hashed_token so it stops working 15 minutes from now. */
export function createLinkToken(hashedToken: string): string {
  const body: Payload = { h: hashedToken, x: Date.now() + TTL_MS };
  const payload = b64url(Buffer.from(JSON.stringify(body)));
  return `${payload}.${sign(payload)}`;
}

/**
 * Unwraps a token from a sign-in link. Returns the inner Supabase hashed_token,
 * or null if the signature does not verify or the 15 minutes have passed. Every
 * failure looks the same to the caller on purpose.
 */
export function readLinkToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(sig);
    if (expected.length !== given.length) return null;
    if (!timingSafeEqual(expected, given)) return null;

    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    if (typeof body.h !== "string" || !body.h) return null;
    if (typeof body.x !== "number" || body.x <= Date.now()) return null;

    return body.h;
  } catch {
    return null;
  }
}
