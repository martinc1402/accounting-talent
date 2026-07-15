import { requireAdmin, logAdminAction } from "@/lib/admin/guard";
import { sendResult } from "@/lib/assessment/service";

/*
  Internal, unlisted, robots-disallowed. Fires Email B (pass) or C (fail) and
  stamps the outcome. Auth + rate limit + 404-on-wrong live in requireAdmin; the
  fat-finger guards (must be 'submitted', no sub-7 pass without override) live in
  sendResult.

  Body:
    { "assessment_id": "<uuid>", "outcome": "passed" }
    { "assessment_id": "<uuid>", "outcome": "passed", "override": true }
    { "assessment_id": "<uuid>", "outcome": "failed", "fail_reason": "quiz_score" }
  fail_reason ∈ quiz_score | writing_generic | writing_ai_or_copied
*/

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: {
    assessment_id?: string;
    outcome?: string;
    fail_reason?: string;
    override?: boolean;
    reviewed_by?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const assessmentId = body.assessment_id?.trim();
  const outcome = body.outcome;
  if (!assessmentId || (outcome !== "passed" && outcome !== "failed")) {
    return Response.json(
      { ok: false, error: "assessment_id and outcome ('passed'|'failed') are required" },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await sendResult(assessmentId, outcome, {
      failReason: body.fail_reason,
      override: body.override === true,
      reviewedBy: body.reviewed_by,
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await logAdminAction({
      action: "result",
      assessment_id: assessmentId,
      outcome: "error",
      detail: error,
    });
    return Response.json({ ok: false, error }, { status: 500 });
  }

  await logAdminAction({
    action: "result",
    assessment_id: assessmentId,
    outcome: result.ok ? outcome : "refused",
    detail: result.ok
      ? result.detail
      : `${result.error}${body.override ? " [override requested]" : ""}`,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status });
  }
  return Response.json({ ok: true, detail: result.detail });
}
