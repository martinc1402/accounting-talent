import { requireAdmin, logAdminAction } from "@/lib/admin/guard";
import { sendAssessmentReminder } from "@/lib/assessment/service";

/*
  Internal, unlisted, robots-disallowed. Sends a reminder for an EXISTING live
  invite (reuses its token — never mints a new attempt). Auth + rate limit + a
  404-on-anything-wrong live in requireAdmin, same as the invite route.

  Body: { "application_id": "<uuid>" }
*/

function baseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host = request.headers.get("host");
  if (!host) return "https://accountingtalent.in";
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { application_id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const applicationId = body.application_id?.trim();
  if (!applicationId) {
    return Response.json(
      { ok: false, error: "application_id is required" },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await sendAssessmentReminder(applicationId, baseUrl(request));
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await logAdminAction({
      action: "remind",
      application_id: applicationId,
      outcome: "error",
      detail: error,
    });
    return Response.json({ ok: false, error }, { status: 500 });
  }

  await logAdminAction({
    action: "remind",
    application_id: applicationId,
    outcome: result.ok ? "sent" : "refused",
    detail: result.ok ? result.detail : result.error,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status });
  }
  return Response.json({ ok: true, detail: result.detail });
}
