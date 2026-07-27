import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader, navFromViewer } from "@/components/ui/SiteHeader";
import { getViewer } from "@/lib/authz/viewer";
import { supabase } from "@/lib/supabase";
import { compensation, compensationLine, type ApplicationRow } from "@/lib/search/candidate";
import { CandidateDashboard, type DashboardData } from "@/components/candidate/CandidateDashboard";
import type { ReactNode } from "react";

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
      <CandidateDashboard data={dto} />
    </>,
  );
}
