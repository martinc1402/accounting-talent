import type { Requirement } from "@/lib/jobs/types";

/*
  Small pure helpers for the job card, kept out of the component so they can be
  unit-tested (vitest only runs lib/).
*/

/** Qualification first, then the order given; at most `max` (default 3). */
export function orderRequirements(reqs: readonly Requirement[], max = 3): Requirement[] {
  const quals = reqs.filter((r) => r.kind === "qualification");
  const rest = reqs.filter((r) => r.kind !== "qualification");
  return [...quals, ...rest].slice(0, max);
}

/** Two-letter tile text: first letters of the first two words, else the first two letters. */
export function monogramOf(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s&]/gu, "").split(/\s+/).filter((w) => w && w !== "&");
  const letters =
    words.length >= 2 ? words[0]![0]! + words[1]![0]! : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/**
 * "checked 3h ago" style. `now` is passed in, never read from the clock here:
 * a statically rendered page would freeze Date.now() at build time and then
 * claim a listing was checked minutes ago for weeks.
 */
export function timeAgo(iso: string, now: Date): string {
  const ms = now.getTime() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

/** "1 Oct", in India time, which is where readers are. */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
