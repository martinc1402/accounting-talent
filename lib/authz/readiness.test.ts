import { describe, it, expect } from "vitest";
import {
  readinessChecklist,
  publicationRequirements,
  isPublished,
  resolveTargetRole,
  resolveExperienceLabel,
  resolveCompensation,
  resolveEtOverlap,
  type ReadinessRow,
} from "./readiness";

// A fully publishable row (all confirmations + minimum checks + data present).
function ready(over: Partial<ReadinessRow> = {}): ReadinessRow {
  const now = "2026-07-24T00:00:00Z";
  return {
    profile_status: "approved",
    role: "Tax Reviewer",
    primary_target_role: "Senior US Tax Reviewer",
    role_confirmed_at: now,
    experience_years: "3 to 5 years",
    us_tax_experience_months: 48,
    experience_confirmed_at: now,
    salary_min_usd: 1800,
    salary_max_usd: 2500,
    hours_per_week_basis: 20,
    compensation_basis_confirmed_at: now,
    timezone: "Asia/Kolkata",
    avail_start_time: "15:30",
    avail_finish_time: "23:30",
    avail_max_weekly_hours: 20,
    availability_structured_confirmed_at: now,
    software_proficiency: [{ name: "CCH Axcess Tax", confirmed_by_candidate: true }],
    software_confirmed_at: now,
    employment_history: [{ role: "Senior Tax Associate" }],
    education: [{ degree: "B.Com" }],
    return_experience: [{ form: "1120", mode: "both" }],
    tax_forms: ["Form 1120"],
    professional_summary: "…",
    identity_verified_at: now,
    english_assessed_at: now,
    english_level: "Advanced",
    qualification_verified_at: now,
    candidate_publication_approved_at: now,
    ...over,
  };
}

describe("publicationRequirements", () => {
  it("a fully-ready profile can publish", () => {
    expect(publicationRequirements(ready()).met).toBe(true);
  });
  it("(1) unconfirmed compensation basis blocks publication", () => {
    const r = publicationRequirements(ready({ compensation_basis_confirmed_at: null }));
    expect(r.met).toBe(false);
    expect(r.missing).toContain("Confirmed compensation and basis");
  });
  it("(2) no employment history blocks publication", () => {
    const r = publicationRequirements(ready({ employment_history: [] }));
    expect(r.met).toBe(false);
    expect(r.missing).toContain("At least one employment-history entry");
  });
  it("requires the minimum AT checks", () => {
    expect(publicationRequirements(ready({ identity_verified_at: null })).missing).toContain("Identity verified");
    expect(publicationRequirements(ready({ english_assessed_at: null })).missing).toContain("English communication assessed");
    expect(publicationRequirements(ready({ qualification_verified_at: null })).missing).toContain("Qualification checked");
  });
  it("(4) never requires employment-history / reference verification", () => {
    const labels = publicationRequirements(ready({})).missing.join(" ") + " ";
    expect(/reference/i.test(labels)).toBe(false);
    expect(/employment.*verif/i.test(labels)).toBe(false);
  });
});

describe("readinessChecklist", () => {
  it("has no employment/reference verification item, and 11 items", () => {
    const items = readinessChecklist(ready());
    expect(items).toHaveLength(11);
    expect(items.some((i) => /reference/i.test(i.label))).toBe(false);
    expect(items.find((i) => i.key === "employment_history")?.label).toMatch(/candidate-provided/i);
  });
  it("(3) reflects confirmed / needs_confirmation / missing", () => {
    // Sai-like: role proposed but unconfirmed, no employment, no checks.
    const sai: ReadinessRow = { role: "Tax Reviewer", primary_target_role: "Senior US Tax Reviewer", experience_years: "3 to 5 years", employment_history: [] };
    const byKey = Object.fromEntries(readinessChecklist(sai).map((i) => [i.key, i.state]));
    expect(byKey.role).toBe("needs_confirmation");
    expect(byKey.experience).toBe("needs_confirmation");
    expect(byKey.employment_history).toBe("missing");
    expect(byKey.identity).toBe("missing");
  });
});

describe("resolvers", () => {
  it("(5) exact experience only from confirmed data; else a range", () => {
    expect(resolveExperienceLabel(ready({ us_tax_experience_months: 48, experience_confirmed_at: "2026-07-24T00:00:00Z" }))).toEqual({ value: "4 years' US tax experience", needsConfirmation: false });
    const range = resolveExperienceLabel({ experience_years: "3 to 5 years", experience_focus: "US tax" });
    expect(range.value).toBe("3–5 years' US tax experience");
    expect(range.needsConfirmation).toBe(true);
    // A non-tax candidate keeps generic wording.
    expect(resolveExperienceLabel({ experience_years: "3 years" }).value).toBe("3 years' experience");
  });
  it("target role: confirmed primary wins; else raw + flag", () => {
    expect(resolveTargetRole(ready())).toEqual({ value: "Senior US Tax Reviewer", needsConfirmation: false });
    expect(resolveTargetRole({ role: "Tax Reviewer / Senior Tax", primary_target_role: "Senior US Tax Reviewer" })).toEqual({ value: "Tax Reviewer / Senior Tax", needsConfirmation: true });
  });
  it("compensation basis line only when confirmed", () => {
    const conf = resolveCompensation(ready());
    expect(conf.line).toBe("$1,800–$2,500/month");
    expect(conf.basis).toBe("Based on up to 20 hours/week");
    const unconf = resolveCompensation(ready({ compensation_basis_confirmed_at: null }));
    expect(unconf.basis).toBeUndefined();
    expect(unconf.needsConfirmation).toBe(true);
  });
  it("(8) ET overlap only with start+finish; computes 4h for 3:30–11:30 PM IST", () => {
    expect(resolveEtOverlap({ availability: "partial overlap" }).value).toBeUndefined();
    const v = resolveEtOverlap(ready({ avail_start_time: "15:30", avail_finish_time: "23:30" }));
    expect(v.value).toBe("4+ hours ET overlap");
  });
});

describe("isPublished / draft gate", () => {
  it("(14) only published is public", () => {
    expect(isPublished({ profile_status: "published" })).toBe(true);
    for (const s of ["draft", "needs_candidate_confirmation", "under_assessment", "approved", "paused"]) {
      expect(isPublished({ profile_status: s })).toBe(false);
    }
  });
});
