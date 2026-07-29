import { describe, it, expect } from "vitest";
import {
  confirmationStatus,
  deriveCandidateVisibility,
  isAtReviewed,
  type VisibilityInput,
} from "./visibilityStatus";

const NOW = new Date("2026-07-28T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe("confirmationStatus (aging)", () => {
  it("no timestamp → needs_confirmation when data exists, missing when not", () => {
    expect(confirmationStatus(null, true, 45, NOW)).toBe("needs_confirmation");
    expect(confirmationStatus(null, false, 45, NOW)).toBe("missing");
  });
  it("confirmed yesterday → confirmed", () => {
    expect(confirmationStatus(daysAgo(1), true, 45, NOW)).toBe("confirmed");
  });
  it("availability (45d): 44d → confirmed, 46d → needs_reconfirmation", () => {
    expect(confirmationStatus(daysAgo(44), true, 45, NOW)).toBe("confirmed");
    expect(confirmationStatus(daysAgo(46), true, 45, NOW)).toBe("needs_reconfirmation");
  });
  it("compensation (90d): 89d → confirmed, 91d → needs_reconfirmation", () => {
    expect(confirmationStatus(daysAgo(89), true, 90, NOW)).toBe("confirmed");
    expect(confirmationStatus(daysAgo(91), true, 90, NOW)).toBe("needs_reconfirmation");
  });
  it("no expiry (software/education): 200d → still confirmed", () => {
    expect(confirmationStatus(daysAgo(200), true, null, NOW)).toBe("confirmed");
  });
  it("garbage timestamp falls back to needs_confirmation/missing", () => {
    expect(confirmationStatus("not-a-date", true, 45, NOW)).toBe("needs_confirmation");
    expect(confirmationStatus("not-a-date", false, 45, NOW)).toBe("missing");
  });
});

describe("isAtReviewed", () => {
  it("true for approved/published/paused, false otherwise", () => {
    for (const s of ["approved", "published", "paused"]) expect(isAtReviewed(s)).toBe(true);
    for (const s of ["draft", "needs_candidate_confirmation", "under_assessment", "", null, undefined])
      expect(isAtReviewed(s)).toBe(false);
  });
});

// A row with all four candidate sections confirmed fresh.
const allConfirmed: VisibilityInput = {
  avail_days: ["Mon"],
  avail_start_time: "15:30",
  avail_finish_time: "23:30",
  availability_structured_confirmed_at: daysAgo(2),
  software_proficiency: [{ name: "CCH Axcess Tax" }],
  software_confirmed_at: daysAgo(2),
  education: [{ degree: "B.Com" }],
  education_confirmed_at: daysAgo(2),
  salary_min_usd: 900,
  salary_max_usd: 1200,
  compensation_basis_confirmed_at: daysAgo(2),
};

describe("deriveCandidateVisibility", () => {
  it("IN REVIEW when not yet AT-approved", () => {
    const v = deriveCandidateVisibility({ ...allConfirmed, profile_status: "under_assessment" }, NOW);
    expect(v.state).toBe("in_review");
    expect(v.headline).toMatch(/reviewing your profile/i);
  });

  it("ACTION NEEDED when approved but a section is unconfirmed", () => {
    const v = deriveCandidateVisibility(
      { ...allConfirmed, profile_status: "approved", availability_structured_confirmed_at: null },
      NOW,
    );
    expect(v.state).toBe("action_needed");
    expect(v.unconfirmedCount).toBe(1);
    expect(v.headline).toContain("1 section needs confirmation");
  });

  it("READY TO PUBLISH when approved + all confirmed + not published", () => {
    const v = deriveCandidateVisibility({ ...allConfirmed, profile_status: "approved" }, NOW);
    expect(v.state).toBe("ready_to_publish");
    expect(v.unconfirmedCount).toBe(0);
    expect(v.headline).toMatch(/ready to publish/i);
  });

  it("LIVE when published + all confirmed, with a published date", () => {
    const v = deriveCandidateVisibility(
      { ...allConfirmed, profile_status: "published", published_at: "2026-07-26T00:00:00Z" },
      NOW,
    );
    expect(v.state).toBe("live");
    expect(v.isLive).toBe(true);
    expect(v.headline).toContain("26 Jul 2026");
  });

  it("expiry does NOT unpublish: a live profile whose availability lapsed is ACTION NEEDED but stays live", () => {
    const v = deriveCandidateVisibility(
      {
        ...allConfirmed,
        profile_status: "published",
        published_at: "2026-05-01T00:00:00Z",
        availability_structured_confirmed_at: daysAgo(46), // lapsed (>45d)
      },
      NOW,
    );
    expect(v.state).toBe("action_needed");
    expect(v.isLive).toBe(true); // still published
    expect(v.sections.find((s) => s.key === "availability")?.status).toBe("needs_reconfirmation");
    expect(v.headline).toMatch(/live, but 1 section needs reconfirmation/i);
  });
});
