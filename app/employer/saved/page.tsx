import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader, navFromViewer } from "@/components/ui/SiteHeader";
import { getViewer } from "@/lib/authz/viewer";
import { listSavedApplicationIds } from "@/lib/authz/savedRepo";
import { supabase } from "@/lib/supabase";
import { resolveTargetRole } from "@/lib/candidate/role";
import { compensation, compensationLine, type ApplicationRow } from "@/lib/search/candidate";
import { isPublished } from "@/lib/authz/readiness";
import { ACTIVE_INTRO_STATUSES } from "@/lib/authz/introductions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Saved candidates",
  robots: { index: false, follow: false },
};

// First name + last initial only — the shortlist never shows full identity.
function anonymizeName(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "Candidate";
  return `${parts[0]} ${(parts[parts.length - 1][0] ?? "").toUpperCase()}.`;
}

export default async function SavedCandidatesPage() {
  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login?next=/employer/saved");
  if (viewer.candidate) redirect("/candidates/me");

  const verified = viewer.account?.verificationState === "verified";
  const ids = verified && viewer.account ? await listSavedApplicationIds(viewer.account.id) : [];

  let rows: { id: string; name: string; role: string; region: string; comp?: string; basis?: string; available: boolean }[] = [];
  if (ids.length && supabase) {
    const { data } = await supabase
      .from("applications")
      .select(
        "id, full_name, role, primary_target_role, role_confirmed_at, country, state, salary_min_usd, salary_max_usd, salary_expectation, compensation_currency, compensation_period, hours_per_week_basis, compensation_basis_confirmed_at, profile_status",
      )
      .in("id", ids);
    type AppRow = ApplicationRow & { salary_expectation?: string | null; profile_status?: string | null };
    const byId = new Map((data ?? []).map((r) => [r.id, r as AppRow]));

    // A saved candidate who paused stays on the shortlist but their profile is only
    // viewable if we still have an active introduction with them (graceful pause).
    let activeIntroIds = new Set<string>();
    if (viewer.account) {
      const { data: intros } = await supabase
        .from("introduction_requests")
        .select("application_id")
        .eq("employer_account_id", viewer.account.id)
        .in("application_id", ids)
        .in("status", ACTIVE_INTRO_STATUSES as unknown as string[]);
      activeIntroIds = new Set((intros ?? []).map((i) => i.application_id as string));
    }

    rows = ids
      .map((id) => byId.get(id))
      .filter((r): r is AppRow => !!r)
      .map((r) => {
        // Verified-employer shortlist: same role + compensation source as the profile.
        const comp = compensationLine(compensation(r)) ?? undefined;
        const basis =
          r.compensation_basis_confirmed_at && r.hours_per_week_basis != null
            ? `Based on up to ${r.hours_per_week_basis} hours/week`
            : undefined;
        return {
          id: r.id,
          name: anonymizeName(r.full_name),
          role: resolveTargetRole(r).value ?? r.role,
          region: r.country ?? r.state ?? "",
          comp,
          basis,
          available: isPublished(r) || activeIntroIds.has(r.id),
        };
      });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <SiteHeader nav={navFromViewer(viewer)} />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
        <h1 className="font-display text-[1.6rem] font-medium text-navy">Saved candidates</h1>
        {!verified ? (
          <p className="mt-3 text-small text-muted">
            Verify your employer account to save and shortlist candidates.{" "}
            <Link href="/employer" className="font-semibold text-navy underline underline-offset-2">
              Go to your account
            </Link>
            .
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-small text-muted">
            You haven&rsquo;t saved any candidates yet. Use &ldquo;Save candidate&rdquo; on a profile
            to build your shortlist.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-line rounded-card border border-line bg-white">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="text-small font-semibold text-ink">{r.name}</div>
                  <div className="text-caption text-muted">
                    {r.role}
                    {r.region ? ` · ${r.region}` : ""}
                  </div>
                  {r.comp && (
                    <div className="mt-0.5 text-caption text-ink">
                      {r.comp}
                      {r.basis ? <span className="text-muted"> · {r.basis}</span> : null}
                    </div>
                  )}
                </div>
                {r.available ? (
                  <Link
                    href={`/candidates/${r.id}`}
                    className="shrink-0 text-caption font-semibold text-navy hover:underline"
                  >
                    View profile
                  </Link>
                ) : (
                  <span className="shrink-0 text-caption font-medium text-subtle" title="This candidate has paused their profile">
                    Currently unavailable
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
