/*
  ET-overlap validation. Given a candidate's IANA timezone and local working
  window, compute the WORST-CASE overlap (minimum across US daylight-saving) with a
  09:00–17:00 America/New_York workday. Pure + DST-aware via Intl offsets — no
  timezone library, no ambient clock. Used to validate the claimed overlap so the
  profile never displays a schedule that contradicts the stated ET overlap; the
  public value is never silently rewritten.
*/

const ET_ZONE = "America/New_York";
const ET_START_MIN = 9 * 60; // 09:00
const ET_END_MIN = 17 * 60; // 17:00
// Reference days that straddle US DST (standard winter / daylight summer).
const REF_DAYS: [number, number, number][] = [
  [2027, 1, 15],
  [2027, 7, 15],
];

/** Offset in minutes (local - UTC) for a zone at a given instant. */
function zoneOffsetMinutes(timeZone: string, instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(instant)) p[part.type] = part.value;
  // Intl may emit hour "24" at midnight; normalise.
  const hour = p.hour === "24" ? 0 : Number(p.hour);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return (asUTC - instant.getTime()) / 60000;
}

/** UTC ms for a wall-clock minute-of-day in a zone on a given calendar date.
 *  Offset is sampled at local noon (DST transitions never fall inside a 9–5 day). */
function wallClockToUTCms(timeZone: string, y: number, m: number, d: number, minuteOfDay: number): number {
  const noon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const off = zoneOffsetMinutes(timeZone, new Date(noon));
  return Date.UTC(y, m - 1, d, 0, 0, 0) + (minuteOfDay - off) * 60000;
}

function overlapHours(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const ms = Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
  return ms / 3_600_000;
}

/**
 * Worst-case daily overlap (hours) between the candidate window and the ET 9–5.
 * @param startMinutes minute-of-day the candidate's window opens (local)
 * @param endMinutes   minute-of-day it closes; if <= start, treated as crossing midnight
 */
export function etOverlapHours(args: {
  timeZone: string;
  startMinutes: number;
  endMinutes: number;
}): number {
  const { timeZone } = args;
  const startMin = args.startMinutes;
  const endMin = args.endMinutes <= args.startMinutes ? args.endMinutes + 1440 : args.endMinutes;

  let worst = Infinity;
  for (const [y, m, d] of REF_DAYS) {
    const cStart = wallClockToUTCms(timeZone, y, m, d, startMin);
    const cEnd = wallClockToUTCms(timeZone, y, m, d, endMin);
    const etStart = wallClockToUTCms(ET_ZONE, y, m, d, ET_START_MIN);
    const etEnd = wallClockToUTCms(ET_ZONE, y, m, d, ET_END_MIN);
    worst = Math.min(worst, overlapHours(cStart, cEnd, etStart, etEnd));
  }
  return Number.isFinite(worst) ? Math.round(worst * 100) / 100 : 0;
}

/** Parse a display window like "3:30 PM–11:30 PM IST" or "12:00 to 8:00 PM IST"
 *  into minute-of-day start/end. Best-effort; returns null if unparseable. */
export function parseWorkingHours(text: string): { startMinutes: number; endMinutes: number } | null {
  const times = [...(text ?? "").matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi)];
  if (times.length < 2) return null;

  // A trailing AM/PM can apply to an earlier bare time ("12:00 to 8:00 PM").
  const tail = times[times.length - 1][3]?.toLowerCase();
  const toMin = (m: RegExpMatchArray): number => {
    let h = Number(m[1]);
    const min = Number(m[2] ?? "0");
    const ap = (m[3] ?? tail ?? "").toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return (h % 24) * 60 + min;
  };
  return { startMinutes: toMin(times[0]), endMinutes: toMin(times[1]) };
}

export type OverlapValidation = {
  computedHours: number | null; // null when timezone/hours are missing/unparseable
  claimedHours: number | null;
  ok: boolean; // true when computed >= claimed (or not enough data to contradict)
};

/** Compare a stored ET-overlap claim against the schedule. Never throws. */
export function validateClaimedOverlap(input: {
  timezone?: string | null;
  workingHours?: string | null;
  claimedHours?: number | null;
}): OverlapValidation {
  const tz = (input.timezone ?? "").trim();
  const parsed = input.workingHours ? parseWorkingHours(input.workingHours) : null;
  const claimed = input.claimedHours ?? null;
  if (!tz || !parsed) return { computedHours: null, claimedHours: claimed, ok: true };

  const computed = etOverlapHours({ timeZone: tz, ...parsed });
  // Allow a 15-minute grace so rounding never trips a genuine schedule.
  const ok = claimed == null || computed + 0.25 >= claimed;
  return { computedHours: computed, claimedHours: claimed, ok };
}
