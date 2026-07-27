import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { SiteHeader, navFromViewer } from "@/components/ui/SiteHeader";
import { getViewer } from "@/lib/authz/viewer";
import { supabase } from "@/lib/supabase";
import { compensation, compensationLine, type ApplicationRow } from "@/lib/search/candidate";
import { applicationToProfile, type ProfileRow } from "@/lib/profile/candidate";
import { disclosureRows } from "@/lib/authz/disclosure";
import { CandidateDashboard, type DashboardData } from "@/components/candidate/CandidateDashboard";
import { deriveCandidateVisibility } from "@/lib/candidate/visibilityStatus";
import { emitSectionConfirmationExpired } from "@/lib/candidate/confirmationEvents";
import { countActiveIntroductionsForCandidate } from "@/lib/authz/introductionsRepo";
import type { ReactNode } from "react";

// "Who sees what" — the two employer stages, from the SAME predicates the
// projection uses (lib/authz/disclosure). Static content, no drift.
function WhoSeesWhat({ candidateId }: { candidateId: string }) {
  // Three tiers, all derived from the SAME predicates the projection uses.
  const publicTier = disclosureRows("anonymous");
  const verified = disclosureRows("free_verified_employer");
  const after = disclosureRows("accepted_introduction");
  return (
    <section className="mb-5 rounded-card border border-line bg-white p-6 lg:p-7">
      <h2 className="font-display text-[1.15rem] font-medium text-ink">Who sees what</h2>
      <p className="mt-1 text-caption text-muted">
        Employers see only limited details until you accept an introduction.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-small">
          <thead>
            <tr className="text-caption tracking-wide text-subtle uppercase">
              <th className="py-2 text-left font-semibold" />
              <th className="py-2 pr-4 text-left font-semibold">Public (anyone online)</th>
              <th className="py-2 pr-4 text-left font-semibold">Verified employers</th>
              <th className="py-2 text-left font-semibold">After accepted introduction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {publicTier.map((row, i) => (
              <tr key={row.key}>
                <td className="py-2.5 pr-4 font-medium text-ink">{row.label}</td>
                <td className="py-2.5 pr-4 text-muted">{row.value}</td>
                <td className="py-2.5 pr-4 text-muted">{verified[i].value}</td>
                <td className="py-2.5 text-muted">{after[i].value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/candidates/${candidateId}?viewAs=employer`}
        className="mt-4 inline-block text-caption font-semibold text-navy underline underline-offset-2"
      >
        Preview as employer
      </Link>
    </section>
  );
}

/*
  The candidate's own dashboard. Owner-only: resolved by applications.user_id, which
  is auto-claimed on magic-link login (app/auth/callback). Lets a candidate view and
  confirm/edit THEIR OWN candidate-provided data via owner-scoped server actions.
*/
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

type Row = ApplicationRow & Record<string, unknown>;

export default async function CandidateMePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app: appParam } = await searchParams;
  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login?next=/candidates/me");

  const nav = navFromViewer(viewer);
  const shell = (children: ReactNode) => (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <SiteHeader nav={nav} />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-5 py-10">{children}</main>
    </div>
  );

  if (!supabase) return shell(<p className="text-small text-muted">Unavailable.</p>);

  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", viewer.userId)
    .order("created_at", { ascending: true });
  const apps = (data ?? []) as Row[];

  if (apps.length === 0) {
    return shell(
      <div className="rounded-card border border-line bg-white p-7">
        <h1 className="font-display text-[1.6rem] font-medium text-navy">No profile linked yet</h1>
        <p className="mt-3 text-small text-muted">
          We couldn&rsquo;t find an application linked to{" "}
          <span className="font-semibold text-ink">{viewer.email}</span>. If you applied with a
          different email address, sign in with that one. Otherwise you can{" "}
          <Link href="/apply" className="font-semibold text-navy underline underline-offset-2">
            apply here
          </Link>
          .
        </p>
      </div>,
    );
  }

  const selected = apps.find((a) => a.id === appParam) ?? apps[0];
  const others = apps.filter((a) => a.id !== selected.id);

  const activeIntroCount = await countActiveIntroductionsForCandidate(selected.id);

  // The employer-facing view-model, reused so the dashboard's read-only cards show
  // exactly what employers see (summary, "in their own words", capabilities,
  // history, target role, proof points).
  const { data: assessmentRow } = await supabase
    .from("assessments")
    .select("writing_sample, quiz_score")
    .eq("application_id", selected.id)
    .in("status", ["submitted", "passed", "failed"])
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const assessment = assessmentRow?.writing_sample
    ? { name: "Skills assessment", score: assessmentRow.quiz_score ?? null, writingSample: assessmentRow.writing_sample as string }
    : null;
  const profileView = applicationToProfile(selected as unknown as ProfileRow, assessment);

  // Open change requests → cards render "Change requested — under review".
  const { data: crRows } = await supabase
    .from("profile_change_requests")
    .select("section")
    .eq("application_id", selected.id)
    .eq("status", "open");
  const openChangeRequests = [...new Set((crRows ?? []).map((r) => String((r as { section: string }).section)))];

  const visibility = deriveCandidateVisibility(selected, new Date());

  // Best-effort: record a section_confirmation_expired event when a confirmation has
  // newly lapsed, so a future nudge system has an event to subscribe to. Deduped in
  // the emitter; only availability + compensation carry an expiry.
  const expiredSections = visibility.sections.filter((s) => s.status === "needs_reconfirmation");
  if (expiredSections.length > 0) {
    const tsByKey: Record<string, unknown> = {
      availability: selected.availability_structured_confirmed_at,
      compensation: selected.compensation_basis_confirmed_at,
    };
    after(async () => {
      for (const s of expiredSections) {
        await emitSectionConfirmationExpired(selected.id, s.key, String(tsByKey[s.key] ?? ""));
      }
    });
  }

  const comp = compensation(selected);
  const software = ((selected.software_proficiency as { name?: string; level?: string; years?: number; last_used?: string }[] | null) ?? [])
    .filter((s) => s?.name)
    .map((s) => ({ name: s.name ?? "", level: s.level ?? "", years: s.years ?? null, last_used: s.last_used ?? "" }));
  const education = ((selected.education as { degree?: string; qualification?: string; field_of_study?: string; institution?: string; year?: string | number; completion_status?: string }[] | null) ?? [])
    .map((e) => ({
      degree: e.degree ?? e.qualification ?? "",
      field_of_study: e.field_of_study ?? "",
      institution: e.institution ?? "",
      year: e.year != null ? String(e.year) : "",
      completion_status: e.completion_status ?? "",
    }))
    .filter((e) => e.degree);

  const dto: DashboardData = {
    id: selected.id,
    fullName: String(selected.full_name ?? ""),
    profileStatus: String(selected.profile_status ?? "draft"),
    availDays: (selected.avail_days as string[] | null) ?? [],
    availStart: String(selected.avail_start_time ?? ""),
    availFinish: String(selected.avail_finish_time ?? ""),
    timezone: String(selected.timezone ?? ""),
    availMaxHours: (selected.avail_max_weekly_hours as number | null) ?? null,
    busySeasonFlexible: selected.avail_busy_season_flexible === true,
    availabilityConfirmed: !!selected.availability_structured_confirmed_at,
    software,
    softwareConfirmed: !!selected.software_confirmed_at,
    education,
    educationConfirmed: !!selected.education_confirmed_at,
    compLine: compensationLine(comp) ?? undefined,
    compBasis:
      selected.hours_per_week_basis != null
        ? `Based on up to ${selected.hours_per_week_basis} hours/week`
        : undefined,
    compBasisConfirmed: !!selected.compensation_basis_confirmed_at,
    publicationApproved: !!selected.candidate_publication_approved_at,
    hasPhoto: !!selected.photo_url,
    // One derived visibility state consumed by the header, checklist, and
    // publication card (see lib/candidate/visibilityStatus).
    status: visibility,
    activeIntroCount,
    workPrefs: {
      employmentType: String(selected.employment_type ?? ""),
      engagement: String(selected.engagement ?? ""),
      willingFullShift: selected.willing_full_shift === true,
      earliestStart: String(selected.start_date ?? ""),
    },
    readOnly: {
      summary: profileView.summary,
      writingSample: profileView.writingSample,
      capabilities: profileView.capabilities,
      history: profileView.history,
      targetRole: profileView.role,
      alternativeRoles: profileView.alternativeRoles ?? [],
      proofPoints: profileView.evidence ?? [],
    },
    openChangeRequests,
  };

  return shell(
    <>
      {others.length > 0 && (
        <div className="mb-4 rounded-card border border-line bg-white px-4 py-3 text-caption text-muted">
          You have {apps.length} linked applications — showing{" "}
          <span className="font-semibold text-ink">{String(selected.role)}</span>. Switch:
          {others.map((o) => (
            <Link key={o.id} href={`/candidates/me?app=${o.id}`} className="ml-2 font-semibold text-navy underline underline-offset-2">
              {String(o.role)}
            </Link>
          ))}
        </div>
      )}
      <WhoSeesWhat candidateId={selected.id} />
      <CandidateDashboard data={dto} />
    </>,
  );
}
