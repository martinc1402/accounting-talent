import { supabase, supabaseConfigured } from "@/lib/supabase";
import { isLikelyBot } from "@/lib/antispam";
import { isRateLimited } from "@/lib/ratelimit";
import { questionIds, scoreQuiz } from "@/lib/assessment/questions";
import { WRITING_MAX, WRITING_MIN } from "@/content/assessment";

/*
  Stage 2 submit. Everything the client sends is re-validated here; the page is a
  courtesy, this route is the gate. Token, status and expiry are re-checked, the
  Stage 1 bot protections are reused, the quiz is scored against the server-only
  key, and the score is never returned to the browser.
*/

const json = (body: unknown, status = 200) =>
  Response.json(body, { status });

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let payload: {
    writing_sample?: string;
    answers?: Record<string, string>;
    hp?: string;
    startedAt?: number;
  };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Silent bot drop, same shape as Stage 1: a filled honeypot or an implausibly
  // fast submission returns ok without persisting. 10s floor — nobody writes 60+
  // words and answers 10 questions faster than that.
  if (isLikelyBot({ hp: payload.hp, startedAt: payload.startedAt, minMs: 10000 })) {
    return json({ ok: true });
  }

  const ip = clientIp(request);
  const rl = await isRateLimited("assessment_submit", ip, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.limited) return json({ ok: true });

  if (!supabaseConfigured || !supabase) {
    // No DB locally: accept so the form UX is exercisable, persist nothing.
    return json({ ok: true });
  }

  const { data: a, error } = await supabase
    .from("assessments")
    .select("id, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  // A bad token is indistinguishable from any other rejection here — no hint.
  if (error || !a) return json({ ok: false, error: "This assessment can't be submitted." }, 404);

  if (a.status !== "invited" && a.status !== "started") {
    return json(
      { ok: false, error: "This assessment has already been submitted." },
      409,
    );
  }
  if (new Date(a.expires_at) < new Date()) {
    return json({ ok: false, error: "This assessment link has expired." }, 410);
  }

  // Writing sample: 60-250 words.
  const writing = String(payload.writing_sample ?? "").trim();
  const words = wordCount(writing);
  if (words < WRITING_MIN) {
    return json(
      { ok: false, field: "writing", error: `Please write at least ${WRITING_MIN} words.` },
      422,
    );
  }
  if (words > WRITING_MAX) {
    return json(
      { ok: false, field: "writing", error: `Please keep it under ${WRITING_MAX} words.` },
      422,
    );
  }

  // Every question must be answered.
  const ids = questionIds();
  const answers = payload.answers ?? {};
  const missing = ids.filter((id) => !answers[id]);
  if (missing.length > 0) {
    return json(
      { ok: false, field: "quiz", error: "Please answer all 10 questions." },
      422,
    );
  }
  // Keep only known question ids.
  const clean: Record<string, string> = {};
  for (const id of ids) clean[id] = String(answers[id]);

  const quizScore = scoreQuiz(clean);

  const { error: upErr } = await supabase
    .from("assessments")
    .update({
      writing_sample: writing,
      quiz_answers: clean,
      quiz_score: quizScore,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", a.id)
    .in("status", ["invited", "started"]); // guard against a double submit race

  if (upErr) {
    return json(
      { ok: false, error: "We couldn't record your submission. Please try again." },
      500,
    );
  }

  return json({ ok: true });
}
