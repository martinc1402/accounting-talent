import { describe, it, expect } from "vitest";
import { applicationToProfile, sampleProfiles, type ProfileRow } from "./candidate";
import { overlapPhrase, compensation, compensationLine } from "@/lib/search/candidate";

const priya = sampleProfiles[0];

// Minimal row helper — applicationToProfile only reads specific fields.
function row(extra: Partial<ProfileRow>): ProfileRow {
  return {
    id: "app-1",
    full_name: "Meera Krishnan",
    role: "US Tax Preparer",
    ...extra,
  } as unknown as ProfileRow;
}

describe("CA qualification status (item 1)", () => {
  it("CA Intermediate is Completed; progression to CA Final lives in the note", () => {
    const ca = priya.education.find((e) => e.qualification === "CA Intermediate")!;
    expect(ca.completed).toBe(true);
    expect(ca.status).toBe("Completed");
    expect(ca.note).toMatch(/pursuing CA Final/i);
    // Never claim CA Final itself is completed.
    expect(priya.education.some((e) => /CA Final/i.test(e.qualification))).toBe(false);
  });
});

describe("overlap + compensation formatting (items 2, 12)", () => {
  it('overlapPhrase renders "N+ hours ET overlap" from the structured field', () => {
    expect(overlapPhrase(row({ et_overlap_hours: 4 }))).toBe("4+ hours ET overlap");
    expect(overlapPhrase(row({ et_overlap_hours: 8 }))).toBe("Full US shift available");
  });
  it("overlapPhrase is null without a structured figure (no echoing working_hours)", () => {
    expect(overlapPhrase(row({ working_hours: "until ~10 pm IST", et_overlap_hours: null }))).toBeNull();
  });
  it("compensation uses an en dash; compensationLine is $900–$1,200/month", () => {
    const comp = compensation(row({ salary_min_usd: 900, salary_max_usd: 1200 }));
    expect(comp?.value).toBe("$900–$1,200");
    expect(comp?.value).not.toContain("-"); // not a hyphen
    expect(compensationLine(comp)).toBe("$900–$1,200/month");
  });
  it("the sample uses the standardized strings", () => {
    expect(priya.overlap).toBe("4+ hours ET overlap");
    expect(priya.decision.find((d) => d.label === "Compensation")?.value).toBe("$900–$1,200/month");
    expect(priya.preferences.find((p) => p.label === "Preferred hours")?.value).toBe("3:30 PM–11:30 PM IST");
  });
});

describe("availability freshness (item 4)", () => {
  const days = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

  it("fresh confirmation shows the value + a Confirmed date", () => {
    const p = applicationToProfile(row({ availability: "Available within 30 days", availability_confirmed_at: days(2) }));
    expect(p.decision.find((d) => d.label === "Availability")?.value).toBe("Available within 30 days");
    expect(p.availabilityConfirmed).toMatch(/^Confirmed /);
  });
  it("stale confirmation is NOT shown as current", () => {
    const p = applicationToProfile(row({ availability: "Available within 30 days", availability_confirmed_at: days(100) }));
    expect(p.decision.find((d) => d.label === "Availability")?.value).toBe("Availability being reconfirmed");
    expect(p.availabilityConfirmed).toBeUndefined();
  });
  it("never confirmed is treated as stale", () => {
    const p = applicationToProfile(row({ availability: "Available now", availability_confirmed_at: null }));
    expect(p.decision.find((d) => d.label === "Availability")?.value).toBe("Availability being reconfirmed");
  });
});

describe("verification is precise (items 3, 5)", () => {
  it("only Identity / English / Qualification checks — never references or employment", () => {
    for (const p of sampleProfiles) {
      const labels = p.verifications.map((v) => v.label);
      expect(new Set(labels)).toEqual(
        new Set(["Identity verified", "English communication", "Qualification checked"]),
      );
      const blob = JSON.stringify(p.verifications).toLowerCase();
      expect(blob).not.toContain("reference");
      expect(blob).not.toContain("employment history");
    }
  });
});

describe("real-data honesty (profile refinement)", () => {
  it("target role: confirmed primary shown; unconfirmed falls back to raw role", () => {
    const confirmed = applicationToProfile(
      row({ role: "Tax Reviewer", primary_target_role: "Senior US Tax Reviewer", role_confirmed_at: "2026-07-01T00:00:00Z" }),
    );
    expect(confirmed.role).toBe("Senior US Tax Reviewer");
    // Unconfirmed proposal must NOT surface publicly as the role.
    const unconfirmed = applicationToProfile(
      row({ role: "Tax Reviewer", primary_target_role: "Senior US Tax Reviewer", role_confirmed_at: null }),
    );
    expect(unconfirmed.role).toBe("Tax Reviewer");
  });

  it("alternative roles only render once the role is confirmed", () => {
    const unconfirmed = applicationToProfile(
      row({ primary_target_role: "Senior US Tax Reviewer", alternative_target_roles: ["Senior US Tax Associate"], role_confirmed_at: null }),
    );
    expect(unconfirmed.alternativeRoles).toBeUndefined();
    const confirmed = applicationToProfile(
      row({ primary_target_role: "Senior US Tax Reviewer", alternative_target_roles: ["Senior US Tax Associate"], role_confirmed_at: "2026-07-01T00:00:00Z" }),
    );
    expect(confirmed.alternativeRoles).toEqual(["Senior US Tax Associate"]);
  });

  it("compensation basis line appears only when the basis is confirmed", () => {
    const unconf = applicationToProfile(row({ salary_min_usd: 1800, salary_max_usd: 2500, hours_per_week_basis: 20, compensation_basis_confirmed_at: null }));
    expect(unconf.compensationBasis).toBeUndefined();
    const conf = applicationToProfile(row({ salary_min_usd: 1800, salary_max_usd: 2500, hours_per_week_basis: 20, compensation_basis_confirmed_at: "2026-07-01T00:00:00Z" }));
    expect(conf.compensationBasis).toBe("Based on up to 20 hours/week");
  });

  it("proof points are candidate-provided by default (never flagged verified)", () => {
    const p = applicationToProfile(
      row({
        proof_points: [
          { value: "1120, 1120-S & 1065", label: "Entity return experience", source_type: "candidate_provided", display_order: 1, is_public: true },
          { value: "60 shareholders", label: "Complex S-corporation handled", source_type: "candidate_provided", display_order: 2, is_public: true },
        ],
      }),
    );
    expect(p.evidence).toHaveLength(2);
    expect(p.evidence!.every((e) => e.verified !== true)).toBe(true);
    expect(p.evidence![0].value).toBe("1120, 1120-S & 1065");
  });

  it("proof points marked accounting_talent_verified carry the verified flag; private ones are hidden", () => {
    const p = applicationToProfile(
      row({
        proof_points: [
          { value: "CPA eligible", label: "Credential", source_type: "accounting_talent_verified", display_order: 1, is_public: true },
          { value: "secret", label: "hidden", source_type: "candidate_provided", display_order: 2, is_public: false },
        ],
      }),
    );
    expect(p.evidence).toHaveLength(1);
    expect(p.evidence![0].verified).toBe(true);
  });

  it("software stays separate records and never fabricates level/years", () => {
    const p = applicationToProfile(
      row({
        software_proficiency: [
          { name: "CCH Axcess Tax" },
          { name: "CCH ProSystem fx Tax" },
          { name: "GoSystem Tax RS" },
        ],
      }),
    );
    expect(p.software.map((s) => s.name)).toEqual(["CCH Axcess Tax", "CCH ProSystem fx Tax", "GoSystem Tax RS"]);
    // No level/years supplied -> no invented meta line.
    expect(p.software.every((s) => s.meta === undefined)).toBe(true);
  });

  it("employment history exposes only the public employer, never the private name", () => {
    const p = applicationToProfile(
      row({
        employment_history: [
          { role: "Senior Tax Associate", employer_public: "Offshore US accounting firm", employer_private: "Acme Offshore Pvt Ltd", responsibilities: ["Reviewed 1120 returns"] },
        ],
      }),
    );
    expect(p.history).toHaveLength(1);
    expect(p.history[0].meta).toBe("Offshore US accounting firm");
    expect(JSON.stringify(p.history)).not.toContain("Acme Offshore");
  });

  it("assessment writing sample is preserved byte-for-byte (unedited)", () => {
    const sample = "I handled a  complex  1120-S with 60 shareholders.\n\nMulti-state: 12 states.";
    const p = applicationToProfile(row({}), { name: "Skills assessment", score: null, writingSample: sample });
    expect(p.writingSample?.text).toBe(sample.trim());
    expect(p.writingSample?.attribution).toMatch(/unedited/);
  });

  it("education generalizes to completion status + field when institution is absent", () => {
    const p = applicationToProfile(
      row({ education: [{ degree: "B.Com", field_of_study: "Commerce", completion_status: "Completed" }] }),
    );
    expect(p.education[0].qualification).toBe("B.Com");
    expect(p.education[0].meta).toBe("Completed · Commerce");
  });
});
