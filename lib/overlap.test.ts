import { describe, it, expect } from "vitest";
import { etOverlapHours, parseWorkingHours, validateClaimedOverlap } from "./overlap";

describe("etOverlapHours (DST worst-case)", () => {
  it("3:30 PM–11:30 PM IST → 4h worst case (EST), 5h in summer", () => {
    // 15:30–23:30 in Asia/Kolkata. Worst case is the EST (winter) day.
    expect(etOverlapHours({ timeZone: "Asia/Kolkata", startMinutes: 15 * 60 + 30, endMinutes: 23 * 60 + 30 })).toBe(4);
  });
  it("the OLD 12:00–8:00 PM IST schedule only clears ~2.5h (why it was inconsistent)", () => {
    const h = etOverlapHours({ timeZone: "Asia/Kolkata", startMinutes: 12 * 60, endMinutes: 20 * 60 });
    expect(h).toBeLessThan(4);
  });
  it("a US Eastern candidate 9–5 fully overlaps (8h)", () => {
    expect(etOverlapHours({ timeZone: "America/New_York", startMinutes: 9 * 60, endMinutes: 17 * 60 })).toBe(8);
  });
  it("handles a window crossing midnight (9 PM–5 AM PHT)", () => {
    const h = etOverlapHours({ timeZone: "Asia/Manila", startMinutes: 21 * 60, endMinutes: 5 * 60 });
    expect(h).toBeGreaterThanOrEqual(4);
  });
});

describe("parseWorkingHours", () => {
  it("parses en-dash 12h ranges", () => {
    expect(parseWorkingHours("3:30 PM–11:30 PM IST")).toEqual({ startMinutes: 15 * 60 + 30, endMinutes: 23 * 60 + 30 });
  });
  it("applies a trailing meridiem to a bare earlier time", () => {
    expect(parseWorkingHours("12:00 to 8:00 PM IST")).toEqual({ startMinutes: 12 * 60, endMinutes: 20 * 60 });
  });
  it("returns null when unparseable", () => {
    expect(parseWorkingHours("flexible")).toBeNull();
  });
});

describe("validateClaimedOverlap", () => {
  it("3:30–11:30 PM IST supports a 4h claim", () => {
    const v = validateClaimedOverlap({ timezone: "Asia/Kolkata", workingHours: "3:30 PM–11:30 PM IST", claimedHours: 4 });
    expect(v.computedHours).toBe(4);
    expect(v.ok).toBe(true);
  });
  it("flags a schedule that cannot support the claim", () => {
    const v = validateClaimedOverlap({ timezone: "Asia/Kolkata", workingHours: "12:00 to 8:00 PM IST", claimedHours: 4 });
    expect(v.ok).toBe(false);
  });
  it("does not contradict when data is missing", () => {
    expect(validateClaimedOverlap({ timezone: null, workingHours: null, claimedHours: 4 }).ok).toBe(true);
  });
});
