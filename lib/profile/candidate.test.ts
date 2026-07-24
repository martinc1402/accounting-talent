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
