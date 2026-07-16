import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { logAdminAction } from "@/lib/admin/guard";

/*
  Resend webhook: records invite bounces so a dead email address is visible in
  the review queue instead of looking like an unresponsive applicant.

  Resend signs webhooks with Svix. We verify the signature against
  RESEND_WEBHOOK_SECRET (the `whsec_...` from the dashboard) over the RAW body —
  Svix signs the exact bytes, so the body must not be re-parsed before checking.
  A bad or stale signature is rejected so nobody can POST fake bounces to mark an
  address dead.

  On email.bounced / email.complained we stamp email_bounced_at on the
  assessment(s) whose application email matches a recipient, and log the event.
*/

const secret = process.env.RESEND_WEBHOOK_SECRET;
const TOLERANCE_S = 300; // reject timestamps more than 5 minutes off

function verifySvix(
  body: string,
  headers: Headers,
): { ok: true } | { ok: false; reason: string } {
  if (!secret) return { ok: false, reason: "no secret configured" };

  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) {
    return { ok: false, reason: "missing svix headers" };
  }

  // Replay guard.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_S) {
    return { ok: false, reason: "stale timestamp" };
  }

  // whsec_<base64> -> raw key bytes.
  const keyB64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = Buffer.from(keyB64, "base64");

  const signedContent = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", key)
    .update(signedContent)
    .digest("base64");
  const expectedBuf = Buffer.from(expected);

  // Header is space-delimited "v1,<sig> v1,<sig>". Any match passes.
  for (const part of signatureHeader.split(" ")) {
    const comma = part.indexOf(",");
    if (comma < 0) continue;
    const version = part.slice(0, comma);
    const sig = part.slice(comma + 1);
    if (version !== "v1") continue;
    const sigBuf = Buffer.from(sig);
    if (
      sigBuf.length === expectedBuf.length &&
      timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "signature mismatch" };
}

export async function POST(request: Request) {
  const body = await request.text();

  const verdict = verifySvix(body, request.headers);
  if (!verdict.ok) {
    return new Response("Bad Request", { status: 400 });
  }

  let event: {
    type?: string;
    created_at?: string;
    data?: { to?: string[]; created_at?: string; bounce?: { type?: string } };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const type = event.type ?? "";
  if (type !== "email.bounced" && type !== "email.complained") {
    // Not a deliverability signal we track. Acknowledge so Resend stops retrying.
    return Response.json({ ok: true, ignored: type });
  }

  const recipients = (event.data?.to ?? [])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const at = event.data?.created_at ?? event.created_at ?? new Date().toISOString();

  if (!supabaseConfigured || !supabase || recipients.length === 0) {
    return Response.json({ ok: true });
  }

  for (const email of recipients) {
    const { data: apps } = await supabase
      .from("applications")
      .select("id")
      .eq("email", email);
    const ids = (apps ?? []).map((a) => a.id);
    if (ids.length === 0) continue;

    await supabase
      .from("assessments")
      .update({ email_bounced_at: at })
      .in("application_id", ids)
      .is("email_bounced_at", null);

    await logAdminAction({
      action: "email_bounce",
      application_id: ids[0],
      outcome: type,
      detail: `${email} (${event.data?.bounce?.type ?? "complaint"})`,
      actor: "resend-webhook",
    });
  }

  return Response.json({ ok: true });
}
