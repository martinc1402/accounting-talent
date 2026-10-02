import { describe, expect, it } from "vitest";
import { monogramOf, orderRequirements, shortDate, timeAgo } from "@/lib/jobs/format";
import { exampleJobs, EXAMPLE_NOW } from "@/content/jobs";

describe("orderRequirements", () => {
  it("puts qualifications first and caps at three", () => {
    const out = orderRequirements([
      { label: "IFRS", kind: "skill" },
      { label: "5+ years", kind: "experience" },
      { label: "CA or ACCA", kind: "qualification" },
      { label: "SAP", kind: "skill" },
    ]);
    expect(out.map((r) => r.label)).toEqual(["CA or ACCA", "IFRS", "5+ years"]);
  });
});

describe("monogramOf", () => {
  it("takes two initials, ignoring ampersands", () => {
    expect(monogramOf("Halden & Wren LLP")).toBe("HW");
    expect(monogramOf("Brightledger")).toBe("BR");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  it("formats minutes, hours and days", () => {
    expect(timeAgo("2026-10-03T11:30:00Z", now)).toBe("30m ago");
    expect(timeAgo("2026-10-03T09:00:00Z", now)).toBe("3h ago");
    expect(timeAgo("2026-10-02T12:00:00Z", now)).toBe("1 day ago");
    expect(timeAgo("2026-09-30T12:00:00Z", now)).toBe("3 days ago");
  });
  it("never goes negative", () => {
    expect(timeAgo("2026-10-03T13:00:00Z", now)).toBe("just now");
  });
});

describe("shortDate", () => {
  it("uses India time", () => {
    // 20:00 UTC on 30 Sep is 01:30 IST on 1 Oct.
    expect(shortDate("2026-09-30T20:00:00Z")).toBe("1 Oct");
  });
});

/*
  The example cards are the only listings on the site, and they are held to the
  same rules a real listing will be. These pin the brief they were written to.
*/
describe("example job listings", () => {
  it("are all examples, with no outbound link", () => {
    for (const job of exampleJobs) {
      expect(job.example, job.id).toBe(true);
      expect(job.applyUrl, job.id).toBeUndefined();
    }
  });

  it("covers the five briefed states", () => {
    expect(exampleJobs.map((j) => j.access)).toEqual([
      "full",
      "full",
      "full",
      "locked",
      "ineligible",
    ]);
    const remote = exampleJobs.filter((j) => j.workMode === "Remote");
    for (const job of remote) expect(job.second.kind, job.id).toBe("working-hours");
    const onsite = exampleJobs.filter((j) => j.workMode !== "Remote");
    for (const job of onsite) expect(job.second.kind, job.id).toBe("visa-sponsorship");
  });

  it("is never checked in the future relative to the example clock", () => {
    for (const job of exampleJobs) {
      expect(new Date(job.checkedAt) <= new Date(EXAMPLE_NOW), job.id).toBe(true);
      expect(new Date(job.firstSeenAt) <= new Date(job.checkedAt), job.id).toBe(true);
    }
  });

  it("states a salary source that matches whether a figure is shown", () => {
    for (const job of exampleJobs) {
      expect(job.salary.display === null, job.id).toBe(
        job.salary.source === "not-disclosed",
      );
    }
  });
});
