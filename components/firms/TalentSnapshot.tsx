import { firms } from "@/content/firms";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section: live talent snapshot. Reads a REAL count from the applications table
  (service-role client, server-side, mirroring the count query in
  lib/assessment/service.ts). No hard-coded or fabricated figures: if Supabase is
  not configured or the query errors, the section shows a plain framing line
  instead of a number.

  Ships with the one verified metric (total applications). `stats` is an array so
  segmented metrics (assessed, US-experience, etc.) can be added later once the
  founder is comfortable publishing them, without reshaping the component.

  The page sets `revalidate = 86400`, so this count refreshes at most daily, which
  keeps the page static (no request-time dependency).
*/
async function totalApplications(): Promise<number | null> {
  if (!supabaseConfigured || !supabase) return null;
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("[snapshot] count failed", error.message);
    return null;
  }
  return count ?? 0;
}

export async function TalentSnapshot() {
  const { snapshot } = firms;
  const total = await totalApplications();

  const stats =
    total !== null ? [{ value: total, label: snapshot.totalLabel }] : [];

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading>{snapshot.heading}</SectionHeading>
        <p className="mt-5 max-w-[60ch] text-body text-muted">
          {snapshot.intro}
        </p>

        {stats.length > 0 ? (
          <dl className="mt-10 flex flex-wrap gap-x-16 gap-y-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <dd className="display display-stat leading-none text-navy tabular-nums">
                  {stat.value.toLocaleString("en-US")}
                </dd>
                <dt className="max-w-[22ch] text-body text-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-8 text-body text-muted">{snapshot.fallback}</p>
        )}
      </Container>
    </section>
  );
}
