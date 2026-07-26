/*
  The single source of truth for a candidate's employer-facing PRIMARY ROLE, used
  by every surface (profile hero + Decision Summary, search card, shortlist) so
  they never diverge. Deliberately a LEAF module with no imports, which keeps the
  search ↔ readiness module graph acyclic (readiness re-exports these).
*/
export type Resolved = { value?: string; needsConfirmation: boolean };

// The narrow row shape this resolver reads. Structurally satisfied by ProfileRow,
// ReadinessRow and the search ApplicationRow alike.
type RoleRow = {
  role?: string | null;
  primary_target_role?: string | null;
  role_confirmed_at?: string | null;
};

const present = (v: unknown): boolean =>
  v !== null && v !== undefined && String(v).trim() !== "";

/** Confirmed primary role wins; otherwise the raw applicant role, flagged if a
 *  primary role has been proposed but not yet confirmed. */
export function resolveTargetRole(row: RoleRow): Resolved {
  if (present(row.role_confirmed_at) && present(row.primary_target_role)) {
    return { value: (row.primary_target_role as string).trim(), needsConfirmation: false };
  }
  return { value: (row.role ?? "").trim() || undefined, needsConfirmation: present(row.primary_target_role) };
}
