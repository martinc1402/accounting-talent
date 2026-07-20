/*
  Whole weeks from today to the next 1 January, for the tax-season urgency line
  ("Tax season starts in N weeks."). Computed server-side; the /employers page
  sets `revalidate` so the static page regenerates and the count stays current.

  Uses the local server date. Counts to the NEXT Jan 1: on/after Jan 1 of the
  current year it targets next year's, so the number is always forward-looking.
  Rounds up, and floors at 1, so the line never reads "0 weeks" or negative.
*/
export function weeksUntilNextJan1(now: Date = new Date()): number {
  const year = now.getFullYear();
  // Next Jan 1 strictly after today (if today IS Jan 1, aim at next year's).
  const target = new Date(year + 1, 0, 1);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.ceil((target.getTime() - now.getTime()) / msPerWeek);
  return Math.max(1, weeks);
}
