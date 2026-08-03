import { describe, it, expect } from "vitest";
import { CHECK_IDS } from "@/lib/candidate/checks";
import {
  verificationChecks,
  verificationGaps,
  checkStateLabels,
  describedCheckIds,
} from "@/lib/marketing/verificationLevels";

/*
  These tests exist to stop marketing copy drifting ahead of the product.

  The failure they are written against is specific and has a history in this
  codebase: a page describes a check, the check is never built (or is later
  removed, as reference checking was in migration 0013), and nothing anywhere
  objects because copy is not typed against capability. Here it is.
*/
describe("verification copy matches what the app can actually stamp", () => {
  it("describes every check the app can stamp", () => {
    for (const id of CHECK_IDS) {
      expect(describedCheckIds()).toContain(id);
    }
  });

  it("describes NO check the app cannot stamp", () => {
    // The one that matters. Adding "Work-email verified" or "Employment
    // verified" to the page without building it fails here.
    for (const id of describedCheckIds()) {
      expect(CHECK_IDS as readonly string[]).toContain(id);
    }
  });

  it("has exactly one description per check, with no duplicates", () => {
    const ids = describedCheckIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(CHECK_IDS.length);
  });
});

describe("verification copy stays honest", () => {
  it("never claims a blanket verified accountant", () => {
    // There is no single badge meaning "everything about this person is
    // checked", because only three specific things are.
    const prose = verificationChecks
      .flatMap((c) => [c.label, c.employer, c.accountant])
      .join(" ")
      .toLowerCase();

    expect(prose).not.toContain("fully verified");
    expect(prose).not.toContain("verified accountant");
    expect(prose).not.toContain("guarantee");
  });

  it("names the checks it deliberately does not run", () => {
    expect(verificationGaps.length).toBeGreaterThan(0);
    const labels = verificationGaps.map((g) => g.label.toLowerCase()).join(" ");
    // Migration 0013 removed reference checking on purpose. If a future edit
    // quietly drops this admission, a firm is left to assume we do it.
    expect(labels).toContain("reference");
  });

  it("offers a state for a check that cannot be completed", () => {
    // Leaving an uncheckable qualification permanently blank reads as a
    // failed check rather than an absent one.
    expect(checkStateLabels.unavailable).toBeTruthy();
    expect(Object.keys(checkStateLabels)).toHaveLength(4);
  });

  it("gives every check copy for both audiences", () => {
    for (const check of verificationChecks) {
      expect(check.employer.trim().length).toBeGreaterThan(0);
      expect(check.accountant.trim().length).toBeGreaterThan(0);
      expect(check.label.trim().length).toBeGreaterThan(0);
    }
  });
});
