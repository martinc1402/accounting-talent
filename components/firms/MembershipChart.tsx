import { firms } from "@/content/firms";

/*
  "What the middleman takes, over time." A two-line chart, built the way MathBars
  is (plain SVG, no chart library, design-system tokens). The agency line sits
  flat at the top ($800 per-seat margin, forever). The AccountingTalent line
  starts at the $99 membership and steps down at "you hire" to a low, deliberately
  UNLABELED flat line (the per-hire plan isn't priced yet). Y is labelled only $0
  and $800; the caption carries the honesty.

  Geometry (user units, viewBox 640x300): Y maps $0..$800 across the plot height;
  X maps 0..24 months. currentColor + a text-colour utility drives each stroke, so
  the lines follow the palette without Tailwind stroke plugins.
*/

const W = 640;
const H = 300;
const PL = 46; // left pad for the $ labels
const PR = 20;
const PT = 26;
const PB = 34; // bottom pad for the month labels

const plotW = W - PL - PR;
const plotH = H - PT - PB;

const x = (month: number) => PL + (month / 24) * plotW;
const y = (dollars: number) => PT + (1 - dollars / 800) * plotH;

const HIRE_MONTH = 6;
const START = 99; // the $99 search membership (a real, stated figure)
const LOW = 22; // the stepped-down per-hire plan: low, and left unlabeled

export function MembershipChart() {
  const c = firms.membership.chart;

  const agencyY = y(800);
  const hireX = x(HIRE_MONTH);
  const startY = y(START);
  const lowY = y(LOW);
  const axisY = y(0);

  const ourLine = `${PL},${startY} ${hireX},${startY} ${hireX},${lowY} ${x(24)},${lowY}`;

  return (
    <figure className="mt-8">
      <figcaption className="text-body font-medium text-ink">
        {c.title}
      </figcaption>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-caption text-subtle">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-[3px] w-5 bg-navy" aria-hidden />
          {c.usLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-[3px] w-5 bg-ink" aria-hidden />
          {c.agencyLabel}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-auto w-full max-w-[720px]"
        role="img"
        aria-label={`${c.title} ${c.agencyLabel} stays flat at ${c.yTop} per month; ${c.usLabel} starts at $99 and steps down after you hire.`}
      >
        {/* Axes: left and bottom hairlines. */}
        <line
          x1={PL}
          y1={PT}
          x2={PL}
          y2={axisY}
          className="text-line"
          stroke="currentColor"
          strokeWidth={1}
        />
        <line
          x1={PL}
          y1={axisY}
          x2={x(24)}
          y2={axisY}
          className="text-line"
          stroke="currentColor"
          strokeWidth={1}
        />

        {/* Y labels: only $0 and $800. */}
        <text
          x={PL - 8}
          y={agencyY + 4}
          textAnchor="end"
          className="fill-subtle text-[13px]"
        >
          {c.yTop}
        </text>
        <text
          x={PL - 8}
          y={axisY + 4}
          textAnchor="end"
          className="fill-subtle text-[13px]"
        >
          {c.yBottom}
        </text>

        {/* "you hire" marker: dotted vertical + label. */}
        <line
          x1={hireX}
          y1={PT}
          x2={hireX}
          y2={axisY}
          className="text-navy/35"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={hireX}
          y={PT - 10}
          textAnchor="middle"
          className="fill-navy text-[13px] font-medium"
        >
          {c.hireLabel}
        </text>

        {/* Agency line: flat at the top, as dark and weighted as the our-line so
            it reads as the $800 the middleman keeps forever. */}
        <line
          x1={PL}
          y1={agencyY}
          x2={x(24)}
          y2={agencyY}
          className="text-ink"
          stroke="currentColor"
          strokeWidth={2.5}
        />

        {/* AccountingTalent line: $99, then stepping down at "you hire". */}
        <polyline
          points={ourLine}
          fill="none"
          className="text-navy"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* The step-down point: a dot at the elbow where the line drops, under the
            "you hire" marker. */}
        <circle cx={hireX} cy={startY} r={4.5} className="fill-navy" />
        {/* $99 start (a real, stated figure); the low line stays unlabeled. */}
        <text
          x={PL + 4}
          y={startY - 8}
          className="fill-navy text-[13px] font-medium"
        >
          $99
        </text>

        {/* X labels. */}
        <text
          x={PL}
          y={axisY + 22}
          textAnchor="start"
          className="fill-subtle text-[13px]"
        >
          {c.xStart}
        </text>
        <text
          x={x(24)}
          y={axisY + 22}
          textAnchor="end"
          className="fill-subtle text-[13px]"
        >
          {c.xEnd}
        </text>
      </svg>

      <figcaption className="mt-3 max-w-[68ch] text-caption text-subtle">
        {c.caption}
      </figcaption>
    </figure>
  );
}
