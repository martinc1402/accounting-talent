import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  getPublicQuestions,
  makeOptionOrder,
  type OptionKey,
} from "@/lib/assessment/questions";
import { assessment } from "@/content/assessment";
import { AssessmentForm } from "./AssessmentForm";

// Invitation-only: never index, never follow. Belt to the robots.ts braces.
export const metadata: Metadata = {
  title: "Skills assessment",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[820px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>
      <main className="flex-1 bg-paper py-12 lg:py-20">
        <div className="mx-auto max-w-[820px] px-5 lg:px-8">{children}</div>
      </main>
    </>
  );
}

function Notice({ heading, body }: { heading: string; body: string }) {
  return (
    <Shell>
      <div className="rounded-card border border-line bg-white p-7 lg:p-10">
        <h1 className="display display-figure text-navy">{heading}</h1>
        <p className="mt-4 max-w-[54ch] text-body text-muted">{body}</p>
      </div>
    </Shell>
  );
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // No database configured (local without env): treat as unknown → 404. There is
  // no public fallback for an invitation-only route.
  if (!supabaseConfigured || !supabase) notFound();

  const { data: a, error } = await supabase
    .from("assessments")
    .select("id, status, expires_at, submitted_at, option_order")
    .eq("token", token)
    .maybeSingle();

  // Unknown token → generic 404, no "wrong token" hint, no form markup.
  if (error || !a) notFound();

  if (a.status === "submitted" || a.status === "passed" || a.status === "failed") {
    const date = a.submitted_at
      ? new Date(a.submitted_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "recently";
    return (
      <Notice
        heading={assessment.alreadyDone.heading}
        body={assessment.alreadyDone.bodyTemplate.replace("{date}", date)}
      />
    );
  }

  if (new Date(a.expires_at) < new Date()) {
    return (
      <Notice
        heading={assessment.expired.heading}
        body={assessment.expired.body}
      />
    );
  }

  // Valid (invited | started). First load: stamp started, and lazily fix the
  // per-respondent option order so a refresh is stable. Both are idempotent —
  // the started update matches zero rows the second time.
  let optionOrder = a.option_order as Record<string, OptionKey[]> | null;
  if (!optionOrder) {
    optionOrder = makeOptionOrder();
    await supabase
      .from("assessments")
      .update({ option_order: optionOrder })
      .eq("id", a.id)
      .is("option_order", null);
  }
  if (a.status === "invited") {
    await supabase
      .from("assessments")
      .update({ status: "started", started_at: new Date().toISOString() })
      .eq("id", a.id)
      .eq("status", "invited");
  }

  const questions = getPublicQuestions(optionOrder);

  return (
    <Shell>
      <AssessmentForm token={token} questions={questions} />
    </Shell>
  );
}
