/*
  The candidate dashboard's single source of truth for "how visible am I?".

  Three previously-disconnected concepts — admin lifecycle (`profile_status`),
  per-section candidate confirmation (`*_confirmed_at`), and confirmation aging —
  are folded into ONE derived state consumed by the header, the task checklist,
  and the publication card. Pure and I/O-free so every rule is unit-tested; `now`
  is injected, never read from the ambient clock here.
*/

// Statuses in which AccountingTalent has completed its review, so the candidate
// owns their own live listing (publish <-> pause). Single source of truth — the
// dashboard's old `AT_APPROVED` set and the action's `CANDIDATE_TOGGLEABLE_STATUSES`
// both import this instead of redefining it.
export const AT_REVIEWED_STATUSES = ["approved", "published", "paused"] as const;

export function isAtReviewed(status: string | null | undefined): boolean {
  return (AT_REVIEWED_STATUSES as readonly string[]).includes((status ?? "").trim());
}

// Days after which a section's confirmation lapses and must be reconfirmed.
// null = never expires. Expiry NEVER auto-unpublishes — it only ages the status.
export const SECTION_EXPIRY_DAYS = {
  availability: 45,
  compensation: 90,
  software: null,
  education: null,
} as const;
export type SectionKey = keyof typeof SECTION_EXPIRY_DAYS;

const DAY_MS = 86_400_000;

const has = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== "";

function formatDate(ts: string | null | undefined): string | undefined {
  const s = (ts ?? "").trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export type ConfirmationStatus =
  | "confirmed"
  | "needs_confirmation" // never confirmed, but data exists to confirm
  | "needs_reconfirmation" // was confirmed, then lapsed past its expiry
  | "missing"; // no data at all

/**
 * The status of one section's confirmation, accounting for aging.
 * @param confirmedAt the stored `*_confirmed_at` timestamp (or null)
 * @param hasData whether there is underlying data to confirm
 * @param expiryDays days after which the confirmation lapses (null = never)
 * @param now injected clock
 */
export function confirmationStatus(
  confirmedAt: string | null | undefined,
  hasData: boolean,
  expiryDays: number | null,
  now: Date,
): ConfirmationStatus {
  const ts = (confirmedAt ?? "").trim();
  if (!ts) return hasData ? "needs_confirmation" : "missing";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return hasData ? "needs_confirmation" : "missing";
  if (expiryDays != null) {
    const ageDays = (now.getTime() - d.getTime()) / DAY_MS;
    if (ageDays > expiryDays) return "needs_reconfirmation";
  }
  return "confirmed";
}

export type SectionVisibility = {
  key: SectionKey;
  label: string;
  anchor: string;
  status: ConfirmationStatus;
  confirmedOn?: string; // formatted date, present only when status === "confirmed"
  expiring: boolean; // has an expiry policy (drives "ages" messaging)
};

export type VisibilityState = "in_review" | "action_needed" | "ready_to_publish" | "live";

export type CandidateVisibility = {
  state: VisibilityState;
  sections: SectionVisibility[];
  unconfirmedCount: number;
  isLive: boolean; // profile_status === "published"
  publishedSince?: string;
  headline: string;
};

// The subset of an applications row the derivation reads. Loose + optional so a
// sparse real row and partial test rows both map cleanly.
export type VisibilityInput = {
  profile_status?: string | null;
  published_at?: string | null;
  avail_days?: string[] | null;
  avail_start_time?: string | null;
  avail_finish_time?: string | null;
  availability_structured_confirmed_at?: string | null;
  software_proficiency?: { name?: string | null }[] | null;
  software_confirmed_at?: string | null;
  education?: unknown[] | null;
  qualification?: string | null;
  education_confirmed_at?: string | null;
  salary_min_usd?: number | null;
  salary_max_usd?: number | null;
  compensation_basis_confirmed_at?: string | null;
};

// The candidate-confirmable sections that gate publication. (Role/experience are
// AT-confirmed BEFORE approval; identity/English/qualification are AT checks — all
// settled by the time profile_status reaches a reviewed state.)
function sectionStatuses(row: VisibilityInput, now: Date): SectionVisibility[] {
  const defs: { key: SectionKey; label: string; confirmedAt: string | null | undefined; hasData: boolean }[] = [
    {
      key: "availability",
      label: "Availability",
      confirmedAt: row.availability_structured_confirmed_at,
      hasData: has(row.avail_days) || (has(row.avail_start_time) && has(row.avail_finish_time)),
    },
    {
      key: "software",
      label: "Software",
      confirmedAt: row.software_confirmed_at,
      hasData: (row.software_proficiency ?? []).some((s) => has(s?.name)),
    },
    {
      key: "education",
      label: "Education",
      confirmedAt: row.education_confirmed_at,
      hasData: (row.education ?? []).length > 0 || has(row.qualification),
    },
    {
      key: "compensation",
      label: "Compensation",
      confirmedAt: row.compensation_basis_confirmed_at,
      hasData: has(row.salary_min_usd) || has(row.salary_max_usd),
    },
  ];

  return defs.map((d) => {
    const expiryDays = SECTION_EXPIRY_DAYS[d.key];
    const status = confirmationStatus(d.confirmedAt, d.hasData, expiryDays, now);
    return {
      key: d.key,
      label: d.label,
      anchor: d.key,
      status,
      confirmedOn: status === "confirmed" ? formatDate(d.confirmedAt) : undefined,
      expiring: expiryDays != null,
    };
  });
}

function headlineFor(v: Omit<CandidateVisibility, "headline">): string {
  const n = v.unconfirmedCount;
  const noun = n === 1 ? "section needs" : "sections need";
  switch (v.state) {
    case "in_review":
      return "AccountingTalent is reviewing your profile — we'll let you know when it's approved.";
    case "action_needed":
      return v.isLive
        ? `Your profile is live, but ${n} ${noun} reconfirmation — employers see it aging until you confirm.`
        : `Your profile isn't visible to employers — ${n} ${noun} confirmation.`;
    case "ready_to_publish":
      return "Ready to publish — flip the switch below to go live.";
    case "live":
      return v.publishedSince
        ? `Live — visible to verified employers since ${v.publishedSince}.`
        : "Live — visible to verified employers.";
  }
}

/** The one derived visibility state for the candidate dashboard. */
export function deriveCandidateVisibility(row: VisibilityInput, now: Date): CandidateVisibility {
  const sections = sectionStatuses(row, now);
  const unconfirmedCount = sections.filter((s) => s.status !== "confirmed").length;
  const isLive = row.profile_status === "published";
  const publishedSince = formatDate(row.published_at);

  let state: VisibilityState;
  if (!isAtReviewed(row.profile_status)) state = "in_review";
  else if (unconfirmedCount > 0) state = "action_needed";
  else if (isLive) state = "live";
  else state = "ready_to_publish";

  const base = { state, sections, unconfirmedCount, isLive, publishedSince };
  return { ...base, headline: headlineFor(base) };
}
