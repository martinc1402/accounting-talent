import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader, navFromViewer } from "@/components/ui/SiteHeader";
import { getViewer } from "@/lib/authz/viewer";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Introductions",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  under_review: "Under review",
  candidate_invited: "Candidate invited",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  expired: "Expired",
};

function anonymizeName(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "Candidate";
  return `${parts[0]} ${(parts[parts.length - 1][0] ?? "").toUpperCase()}.`;
}

export default async function IntroductionsPage() {
  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login?next=/employer/introductions");

  const verified = viewer.account?.verificationState === "verified";
  type Row = { id: string; application_id: string; status: string; created_at: string; name: string; role: string; accepted: boolean };
  let rows: Row[] = [];

  if (verified && viewer.account && supabase) {
    const { data: intros } = await supabase
      .from("introduction_requests")
      .select("id, application_id, status, created_at")
      .eq("employer_account_id", viewer.account.id)
      .order("created_at", { ascending: false });
    const appIds = [...new Set((intros ?? []).map((i) => i.application_id))];
    const { data: apps } = appIds.length
      ? await supabase.from("applications").select("id, full_name, role").in("id", appIds)
      : { data: [] as { id: string; full_name: string; role: string }[] };
    const byId = new Map((apps ?? []).map((a) => [a.id, a]));
    rows = (intros ?? []).map((i) => {
      const a = byId.get(i.application_id);
      const accepted = i.status === "accepted";
      return {
        id: i.id,
        application_id: i.application_id,
        status: i.status,
        created_at: i.created_at,
        // Full name only once accepted; otherwise anonymised.
        name: a ? (accepted ? a.full_name : anonymizeName(a.full_name)) : "Candidate",
        role: a?.role ?? "",
        accepted,
      };
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <SiteHeader nav={navFromViewer(viewer)} />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
        <h1 className="font-display text-[1.6rem] font-medium text-navy">Introductions</h1>
        {!verified ? (
          <p className="mt-3 text-small text-muted">
            Verify your employer account to request introductions.{" "}
            <Link href="/employer" className="font-semibold text-navy underline underline-offset-2">
              Go to your account
            </Link>
            .
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-small text-muted">No introduction requests yet.</p>
        ) : (
          <ul className="mt-5 divide-y divide-line rounded-card border border-line bg-white">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="text-small font-semibold text-ink">{r.name}</div>
                  <div className="text-caption text-muted">{r.role}</div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-caption font-semibold ${
                      r.accepted ? "bg-verified/10 text-verified-deep" : "border border-line text-subtle"
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <Link
                    href={`/candidates/${r.application_id}`}
                    className="text-caption font-semibold text-navy hover:underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
