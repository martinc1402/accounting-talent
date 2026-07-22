import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { applicationToProfile, type ProfileRow } from "@/lib/profile/candidate";
import { CandidateProfile } from "@/components/profile/CandidateProfile";

/*
  The candidate profile a firm opens from a search card. Invitation-adjacent and
  PII-bearing, so: never indexed (metadata below + robots.ts), and gated to
  VERIFIED profiles only — an application without verified_at 404s, exactly like
  an unknown id. Contact details are never rendered (released only after an
  accepted introduction). Mirrors the app/assessment/[token] route: async server
  component, awaited params, service-role query, notFound() on anything missing.
*/

// Shared by generateMetadata and the page so the row is fetched once per request.
const loadCandidate = cache(async (id: string) => {
  if (!supabaseConfigured || !supabase) return null;

  const { data: app, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Unknown id, query error, or not-yet-verified → treated identically (404).
  if (error || !app || !app.verified_at) return null;

  // The candidate's own words come from their completed assessment.
  const { data: assessment } = await supabase
    .from("assessments")
    .select("writing_sample, quiz_score")
    .eq("application_id", id)
    .in("status", ["submitted", "passed", "failed"])
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { app, assessment };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadCandidate(id);
  const title = data ? `${data.app.full_name} · ${data.app.role}` : "Candidate profile";
  // Never index a candidate profile.
  return { title, robots: { index: false, follow: false } };
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadCandidate(id);
  if (!data) notFound();

  const assessment = data.assessment?.writing_sample
    ? {
        name: "Skills assessment",
        score: data.assessment.quiz_score ?? null,
        writingSample: data.assessment.writing_sample as string,
      }
    : null;

  const profile = applicationToProfile(data.app as ProfileRow, assessment);
  return <CandidateProfile profile={profile} />;
}
