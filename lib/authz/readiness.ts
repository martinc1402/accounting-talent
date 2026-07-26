/*
  Profile readiness, publication gating, and honest field resolution. Pure and
  I/O-free so every rule is unit-tested directly. This is where "unconfirmed data
  stays admin-only, never presented publicly as fact" is enforced:

  - readinessChecklist() drives the admin panel (per-item confirmed/missing/needs).
  - publicationRequirements() blocks publication until the minimum data + checks
    are complete (enforced server-side in the admin publish action).
  - the resolve*() helpers return a public value ONLY when confirmed; otherwise an
    honest fallback (a grammatical range, the raw text, or nothing) plus a
    needsConfirmation flag that the admin sees and the public never does.
*/
import { etOverlapHours } from "@/lib/overlap";
import { compensationLine } from "@/lib/search/candidate";
import { resolveTargetRole, type Resolved } from "@/lib/candidate/role";

// Re-exported so existing importers (lib/profile/candidate.ts, tests) keep working.
export { resolveTargetRole };
export type { Resolved };

// The subset of an applications row that readiness reads. Loose + optional so a
// sparse real candidate maps cleanly and tests can build partial rows.
export type ReadinessRow = {
  profile_status?: string | null;
  role?: string;
  primary_target_role?: string | null;
  alternative_target_roles?: string[] | null;
  role_confirmed_at?: string | null;
  experience_years?: string | null;
  experience_years_num?: number | null;
  experience_focus?: string | null;
  us_tax_experience_start_date?: string | null;
  us_tax_experience_months?: number | null;
  experience_confirmed_at?: string | null;
  salary_min_usd?: number | null;
  salary_max_usd?: number | null;
  salary_expectation?: string | null;
  compensation_currency?: string | null;
  compensation_period?: string | null;
  hours_per_week_basis?: number | null;
  compensation_basis_confirmed_at?: string | null;
  timezone?: string | null;
  avail_days?: string[] | null;
  avail_start_time?: string | null;
  avail_finish_time?: string | null;
  avail_max_weekly_hours?: number | null;
  avail_busy_season_flexible?: boolean | null;
  availability?: string | null;
  availability_structured_confirmed_at?: string | null;
  start_date?: string | null;
  software_proficiency?: { name?: string; level?: string; years?: number; last_used?: string; confirmed_by_candidate?: boolean }[] | null;
  software_confirmed_at?: string | null;
  employment_history?: unknown[] | null;
  education?: unknown[] | null;
  qualification?: string | null;
  education_confirmed_at?: string | null;
  return_experience?: { form?: string; mode?: string }[] | null;
  tax_forms?: string[] | null;
  professional_summary?: string | null;
  identity_verified_at?: string | null;
  english_level?: string | null;
  english_assessed_at?: string | null;
  qualification_verified_at?: string | null;
  candidate_publication_approved_at?: string | null;
};

const has = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== "";

export type CheckState = "confirmed" | "needs_confirmation" | "missing";
export type ChecklistItem = { key: string; label: string; state: CheckState };

/** Three-state helper: confirmed when the timestamp is set, needs_confirmation when
 *  there's underlying data awaiting confirmation, missing when there's nothing. */
function tri(confirmedAt: unknown, hasData: boolean): CheckState {
  if (has(confirmedAt)) return "confirmed";
  return hasData ? "needs_confirmation" : "missing";
}

export function readinessChecklist(row: ReadinessRow): ChecklistItem[] {
  const sw = row.software_proficiency ?? [];
  const softwareCount = sw.filter((s) => has(s?.name)).length;
  const softwareHasDepth = sw.some((s) => has(s?.level) || s?.years != null || has(s?.last_used));
  const employmentCount = (row.employment_history ?? []).length;
  const educationCaptured = (row.education ?? []).length > 0 || has(row.qualification);
  const availConfirmed = has(row.availability_structured_confirmed_at);
  const hasHours = has(row.avail_start_time) && has(row.avail_finish_time);
  const overlapCalculable = has(resolveEtOverlap(row).value);

  return [
    { key: "role", label: "Primary employer-facing role confirmed", state: tri(row.role_confirmed_at, has(row.primary_target_role)) },
    { key: "experience", label: "Exact US tax experience confirmed", state: tri(row.experience_confirmed_at, has(row.us_tax_experience_start_date) || has(row.us_tax_experience_months) || has(row.experience_years)) },
    { key: "compensation_basis", label: "Compensation basis confirmed", state: tri(row.compensation_basis_confirmed_at, has(row.salary_min_usd) || has(row.hours_per_week_basis)) },
    { key: "available_days", label: "Available days confirmed", state: has(row.avail_days) ? (availConfirmed ? "confirmed" : "needs_confirmation") : "missing" },
    { key: "hours", label: "Start & finish hours confirmed", state: hasHours ? (availConfirmed ? "confirmed" : "needs_confirmation") : "missing" },
    { key: "et_overlap", label: "ET overlap calculated", state: overlapCalculable ? "confirmed" : "missing" },
    { key: "software", label: "Software products confirmed", state: tri(row.software_confirmed_at, softwareCount > 0) },
    { key: "software_depth", label: "Software depth confirmed or intentionally omitted", state: softwareHasDepth ? "confirmed" : softwareCount > 0 ? "needs_confirmation" : "missing" },
    // "Captured", not verified — present = confirmed as captured; none = missing.
    { key: "employment_history", label: "Candidate-provided employment history captured", state: employmentCount > 0 ? "confirmed" : "missing" },
    { key: "education", label: "Education details captured", state: (row.education ?? []).length > 0 ? "confirmed" : educationCaptured ? "needs_confirmation" : "missing" },
    { key: "candidate_publication", label: "Candidate approved profile copy", state: has(row.candidate_publication_approved_at) ? "confirmed" : "missing" },
    { key: "identity", label: "Identity verified", state: has(row.identity_verified_at) ? "confirmed" : "missing" },
    { key: "english", label: "English communication assessed", state: has(row.english_assessed_at) ? "confirmed" : "missing" },
    { key: "qualification", label: "Qualification checked", state: has(row.qualification_verified_at) ? "confirmed" : "missing" },
  ];
}

/** The minimum data + checks required before a profile may be published (item 12).
 *  Employment-history VERIFICATION is deliberately NOT required. */
export function publicationRequirements(row: ReadinessRow): { met: boolean; missing: string[] } {
  const missing: string[] = [];
  const req = (ok: boolean, label: string) => { if (!ok) missing.push(label); };

  req(has(row.primary_target_role) && has(row.role_confirmed_at), "Confirmed primary target role");
  req(has(row.salary_min_usd) && has(row.salary_max_usd) && has(row.compensation_basis_confirmed_at), "Confirmed compensation and basis");
  req(has(row.avail_max_weekly_hours) && has(row.availability_structured_confirmed_at), "Confirmed maximum weekly hours");
  req(has(row.availability_structured_confirmed_at), "Confirmed availability");
  req(has(row.us_tax_experience_start_date) || has(row.us_tax_experience_months) || has(row.experience_years), "US tax experience information");
  req((row.employment_history ?? []).length > 0, "At least one employment-history entry");
  req((row.return_experience ?? []).length > 0 || (row.tax_forms ?? []).length > 0, "At least one return type");
  req((row.software_proficiency ?? []).some((s) => has(s?.name) && s?.confirmed_by_candidate) || (has(row.software_confirmed_at) && (row.software_proficiency ?? []).length > 0), "At least one confirmed software product");
  req((row.education ?? []).length > 0 || has(row.qualification), "Education status");
  req(has(row.professional_summary), "Professional summary");
  req(has(row.candidate_publication_approved_at), "Candidate approval to publish");
  // Minimum AccountingTalent checks.
  req(has(row.identity_verified_at), "Identity verified");
  req(has(row.english_assessed_at), "English communication assessed");
  req(has(row.qualification_verified_at), "Qualification checked");

  return { met: missing.length === 0, missing };
}

export function isPublished(row: ReadinessRow): boolean {
  return row.profile_status === "published";
}

// --- honest field resolvers (value + needsConfirmation) --------------------
// resolveTargetRole + Resolved live in the leaf module lib/candidate/role.ts (so
// the search card can share the exact same role source without an import cycle);
// re-exported here for back-compat with existing importers.

/** Exact "N years' US tax experience" only from a confirmed start date / months;
 *  else a grammatical range ("3–5 years' US tax experience"). Never fabricates. */
export function resolveExperienceLabel(row: ReadinessRow): Resolved {
  if (has(row.experience_confirmed_at) && (has(row.us_tax_experience_months) || has(row.us_tax_experience_start_date))) {
    let months = row.us_tax_experience_months ?? 0;
    if (!months && row.us_tax_experience_start_date) {
      const start = new Date(row.us_tax_experience_start_date);
      if (!Number.isNaN(start.getTime())) months = Math.max(0, Math.round((Date.now() - start.getTime()) / (30.44 * 86_400_000)));
    }
    const years = Math.floor(months / 12);
    const label = months % 12 >= 6 ? `${years}+ years' US tax experience` : `${years} years' US tax experience`;
    return { value: label, needsConfirmation: false };
  }
  const raw = (row.experience_years ?? "").trim();
  if (!raw) return { value: undefined, needsConfirmation: false };
  // "3 to 5 years" / "3-5 years" -> "3–5 years' <focus> experience" (en dash).
  const range = raw.replace(/\s*(?:to|-|–)\s*/i, "–").replace(/\s*years?/i, "");
  const focus = (row.experience_focus ?? "").trim();
  return { value: `${range} years'${focus ? ` ${focus}` : ""} experience`, needsConfirmation: true };
}

/** Compensation line + optional basis line, basis shown only when confirmed. */
export function resolveCompensation(row: ReadinessRow): {
  line?: string;
  basis?: string;
  needsConfirmation: boolean;
} {
  const comp =
    has(row.salary_min_usd) && has(row.salary_max_usd)
      ? { value: `$${(row.salary_min_usd as number).toLocaleString("en-US")}–$${(row.salary_max_usd as number).toLocaleString("en-US")}`, unit: `${row.compensation_currency ?? "USD"} / ${row.compensation_period ?? "month"}` }
      : (row.salary_expectation ?? "").trim()
        ? { value: (row.salary_expectation as string).trim(), unit: "" }
        : undefined;
  if (!comp) return { needsConfirmation: false };
  const confirmed = has(row.compensation_basis_confirmed_at);
  const basis = confirmed && has(row.hours_per_week_basis) ? `Based on up to ${row.hours_per_week_basis} hours/week` : undefined;
  return { line: compensationLine(comp) ?? comp.value, basis, needsConfirmation: !confirmed };
}

/** ET overlap only when start+finish+timezone are known (no fabrication). */
export function resolveEtOverlap(row: ReadinessRow): Resolved {
  const tz = (row.timezone ?? "").trim();
  const start = (row.avail_start_time ?? "").trim();
  const finish = (row.avail_finish_time ?? "").trim();
  if (!tz || !start || !finish) return { value: undefined, needsConfirmation: has(row.availability) };
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h % 24) * 60 + (m || 0);
  };
  const hours = etOverlapHours({ timeZone: tz, startMinutes: toMin(start), endMinutes: toMin(finish) });
  if (hours <= 0) return { value: undefined, needsConfirmation: false };
  const lo = Math.floor(hours);
  const label = hours >= lo + 0.5 ? `${lo}–${lo + 1} hours ET overlap` : `${lo}+ hours ET overlap`;
  return { value: label, needsConfirmation: !has(row.availability_structured_confirmed_at) };
}
