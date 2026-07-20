/*
  The two-bar comparison, extracted from TheMath so it can be reused verbatim on
  /employers (block 2 of the proof triad) from the employer's point of view. The
  argument of the business is one number sitting next to another number: two bars
  on one shared dollar scale, so the comparison is the picture. 100% of the track
  is $2,000 and every width below is (amount / 2000).

  The direct-route bar is shorter AND entirely the worker's. The 40% of track it
  does not use is a dashed "ghost" segment naming what the paying firm saves.

  Plain flex divs and percentage widths. No chart library for four rectangles.
  Nothing animates its width; the only motion is the row's `.reveal` (already
  reduced-motion aware).

  This renders the bars only, not the caption: callers own the caption so the
  homepage keeps it below its takeaway line while the employer page places it
  directly under the bars. `comparison.caption` carries the text either way.
*/

export type MathComparison = {
  agency: {
    label: string;
    firmPays: string;
    you: { amount: string; label: string; pct: number };
    keeps: { amount: string; sub: string; pct: number };
  };
  direct: {
    label: string;
    firmPays: string;
    you: { amount: string; label: string; pct: number };
    saves: { amount: string; pct: number };
  };
  caption: string;
};

// Both tracks are the same 48px. The ghost's 1px border does not change that:
// Tailwind sets border-box sizing, so the border eats into the height instead of
// adding to it.
const BAR = "flex h-12 w-full";
const AMOUNT = "display text-[22px] leading-none sm:text-[26px]";

// The label under a segment, sized to that segment from sm up. Below sm these
// stack full width.
const SUBLABEL = "text-caption text-subtle";

function BarRow({
  label,
  firmPays,
  children,
}: {
  label: string;
  firmPays: string;
  children: React.ReactNode;
}) {
  return (
    <div className="reveal">
      {/* flex-wrap: the labels wrap to two lines on a phone rather than
          squeezing. */}
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="text-body font-medium text-ink">{label}</h3>
        <p className="text-small text-subtle">{firmPays}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function MathBars({ comparison }: { comparison: MathComparison }) {
  const { agency, direct } = comparison;

  return (
    <div className="reveal-group max-w-[900px] space-y-10">
      {/* First bar: only ~30% of the money reaches the person doing the work. */}
      <BarRow label={agency.label} firmPays={agency.firmPays}>
        <div className={`${BAR} overflow-hidden rounded-card`}>
          {/* The dollar amount stays INSIDE its navy segment at every width. */}
          <div
            style={{ width: `${agency.you.pct}%` }}
            className="flex items-center bg-navy px-3 sm:px-4"
          >
            <span className={`${AMOUNT} text-white`}>{agency.you.amount}</span>
          </div>

          {/* White with a hairline, not a grey fill: reads as empty space taken
              away, which is what "the middle keeps this" means. */}
          <div
            style={{ width: `${agency.keeps.pct}%` }}
            className="flex items-center border border-line bg-white px-3 sm:px-4"
          >
            <span className="hidden text-small text-ink sm:block">
              {agency.keeps.amount}
            </span>
          </div>
        </div>

        {/* The segment widths ride on a CSS variable rather than an inline
            width, because an inline width would also apply below sm, where these
            stack full width. The variable is only read by the sm: utility. */}
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-0">
          <p
            style={{ "--seg": `${agency.you.pct}%` } as React.CSSProperties}
            className={`${SUBLABEL} sm:w-[var(--seg)] sm:pr-2`}
          >
            {agency.you.label}
          </p>

          <p
            style={{ "--seg": `${agency.keeps.pct}%` } as React.CSSProperties}
            className={`${SUBLABEL} sm:w-[var(--seg)]`}
          >
            {/* Below sm this carries the amount that left the bar. */}
            <span className="sm:hidden">{agency.keeps.amount} · </span>
            {agency.keeps.sub}
          </p>
        </div>
      </BarRow>

      {/* Second bar: a shorter bar, all of it the worker's, and the space it
          leaves is what the paying firm keeps. */}
      <BarRow label={direct.label} firmPays={direct.firmPays}>
        <div className={BAR}>
          <div
            style={{ width: `${direct.you.pct}%` }}
            className="flex items-center rounded-l-card bg-navy px-3 sm:px-4"
          >
            <span className={`${AMOUNT} whitespace-nowrap text-white`}>
              {direct.you.amount}
            </span>
          </div>

          {/* The ghost. No fill and no left border, so it reads as the track the
              navy bar did not need rather than as a second bar. */}
          <div
            style={{ width: `${direct.saves.pct}%` }}
            className="flex items-center justify-center rounded-r-card border border-l-0 border-dashed border-navy/40 px-2"
          >
            <span className="hidden text-caption text-subtle sm:block">
              {direct.saves.amount}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-0">
          <p
            style={{ "--seg": `${direct.you.pct}%` } as React.CSSProperties}
            className={`${SUBLABEL} sm:w-[var(--seg)] sm:pr-2`}
          >
            {direct.you.label}
          </p>

          {/* The ghost's label, for the widths where it will not fit inside the
              ghost itself. */}
          <p className={`${SUBLABEL} sm:hidden`}>{direct.saves.amount}</p>
        </div>
      </BarRow>
    </div>
  );
}
