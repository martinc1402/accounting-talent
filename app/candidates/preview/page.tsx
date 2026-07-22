import type { Metadata } from "next";
import { CandidateProfile } from "@/components/profile/CandidateProfile";
import { sampleProfiles } from "@/lib/profile/candidate";

/*
  Local preview of the candidate profile page with sample data. The real route
  (/candidates/[id]) is gated to verified candidates, of which there are none
  yet, so this renders the same component with a fully-populated sample profile.

  Static segment "preview" takes precedence over the dynamic [id], and a real
  candidate id is always a uuid, so this never shadows a real profile. noindex,
  same as the rest of /candidates. Delete this route once real verified profiles
  exist (or keep it as a design reference).

  ?c=daniel switches sample; defaults to Arjun (no photo -> initials fallback).
*/
export const metadata: Metadata = {
  title: "Candidate profile preview",
  robots: { index: false, follow: false },
};

export default async function CandidatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const profile = sampleProfiles.find((p) => p.id === `sample-${c}`) ?? sampleProfiles[0];
  return <CandidateProfile profile={profile} />;
}
