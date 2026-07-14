import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { hero, math } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  The whole argument of the business is one number sitting next to another
  number. Two bars on one shared dollar scale, so the comparison is the picture:
  100% of the track is $2,000, and every width below is (amount / 2000).

  The direct-route bar is shorter AND entirely yours. The 40% of track it does
  not use is no longer empty: it is a dashed "ghost" segment naming what the US
  firm saves. That is the half of the argument the section used to leave implicit
  ("everyone wins except the middleman") and the reason a firm would ever bother.

  Plain flex divs and percentage widths. No chart library for four rectangles.

  Nothing here animates its width. The section's only motion is the row's
  `.reveal` (a fade and a translate, already reduced-motion aware). A savings box
  that grows on scroll would read as a gimmick, and the ghost segment is a fact,
  not a flourish.
*/

// Both tracks are the same 48px. The ghost's 1px border does not change that:
// Tailwind sets border-box sizing, so the border eats into the height instead of
// adding to it.
const BAR = "flex h-12 w-full";
const AMOUNT = "display text-[22px] leading-none sm:text-[26px]";

// The label under a segment, sized to that segment from sm up. Below sm these
// stack full width: at 375px the 30% column is only 96px, nowhere near enough
// for "you receive · about ₹55,000/mo".
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
      {/* flex-wrap: the labels are longer now ("Through an offshore firm or
          agency" + "US firm pays $2,000/mo") and must wrap to two lines on a
          phone rather than squeezing. */}
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="text-body font-medium text-ink">{label}</h3>
        <p className="text-small text-subtle">{firmPays}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function TheMath() {
  const { agency, direct, caption } = math.comparison;

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeading className="reveal max-w-[14ch] sm:max-w-none">
          {math.h2}
        </SectionHeading>

        <p className="reveal mt-6 max-w-[62ch] text-lede text-muted">
          {math.leadIn}
        </p>

        <div className="reveal-group mt-12 max-w-[900px] space-y-10">
          {/* Offshore firm or agency: 30% of the money reaches the person doing
              the work. */}
          <BarRow label={agency.label} firmPays={agency.firmPays}>
            <div className={`${BAR} overflow-hidden rounded-card`}>
              {/*
                The dollar amounts stay INSIDE their navy segments at every
                width. Measured at 375px: the segment is 96px and "$600" needs
                74px, so it fits. It is the label that does not fit, which is why
                only that one moves.
              */}
              <div
                style={{ width: `${agency.you.pct}%` }}
                className="flex items-center bg-navy px-3 sm:px-4"
              >
                <span className={`${AMOUNT} text-white`}>
                  {agency.you.amount}
                </span>
              </div>

              <div
                style={{ width: `${agency.keeps.pct}%` }}
                className="flex items-center bg-line px-3 sm:px-4"
              >
                {/* 231px of text in a 224px segment at 375px. Drops below the
                    bar there instead of overflowing. */}
                <span className="hidden text-small text-ink sm:block">
                  {agency.keeps.amount}
                </span>
              </div>
            </div>

            {/*
              The segment widths ride on a CSS variable rather than an inline
              `width`, because an inline width would also apply below sm, where
              these stack full width. The variable is only read by the sm: utility.
            */}
            <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-0">
              <p
                style={{ "--seg": `${agency.you.pct}%` } as React.CSSProperties}
                className={`${SUBLABEL} sm:w-[var(--seg)] sm:pr-2`}
              >
                {agency.you.label}
              </p>

              <p
                style={
                  { "--seg": `${agency.keeps.pct}%` } as React.CSSProperties
                }
                className={`${SUBLABEL} sm:w-[var(--seg)]`}
              >
                {/* Below sm this carries the amount that left the bar. */}
                <span className="sm:hidden">{agency.keeps.amount} · </span>
                {agency.keeps.sub}
              </p>
            </div>
          </BarRow>

          {/* Hired directly: a shorter bar, all of it yours, and the space it
              leaves is what the US firm keeps. */}
          <BarRow label={direct.label} firmPays={direct.firmPays}>
            <div className={BAR}>
              <div
                style={{ width: `${direct.you.pct}%` }}
                className="flex items-center rounded-l-card bg-navy px-3 sm:px-4"
              >
                {/* Fits at 375px too: 177px of text in a 192px segment. */}
                <span className={`${AMOUNT} whitespace-nowrap text-white`}>
                  {direct.you.amount}
                </span>
              </div>

              {/*
                The ghost. No fill and no left border, so it reads as the track
                the navy bar did not need rather than as a second bar. The
                border tone is the one the outline button already uses, so this
                introduces no new colour.
              */}
              <div
                style={{ width: `${direct.saves.pct}%` }}
                className="flex items-center justify-center rounded-r-card border border-l-0 border-dashed border-navy/25 px-2"
              >
                {/* 178px of text in a 128px segment at 375px. Drops below. */}
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

              {/* The ghost's label, for the widths where it will not fit inside
                  the ghost itself. */}
              <p className={`${SUBLABEL} sm:hidden`}>{direct.saves.amount}</p>
            </div>
          </BarRow>
        </div>

        {/*
          The takeaway. Weight 500, not the display face's default 300: at this
          size a 300-weight serif in navy reads washed out and pale, which is what
          made this line look weak. The colour was always the full site navy
          (#131F5B, 14.2:1 on white) and there is no opacity on it.

          The weight has to come from .display-solid in globals.css rather than
          Tailwind's font-medium: `.display` is unlayered CSS and utilities live
          in @layer utilities, so a utility silently loses to it.
        */}
        <p className="reveal display display-step display-solid mt-6 max-w-[24ch] text-navy sm:max-w-none">
          {math.delta}
        </p>

        {/* A link, not a button: the section is an argument, not a form. Same
            label and destination as every other CTA on the site. */}
        <Link
          href="/apply"
          className="group mt-2 inline-flex items-center gap-1.5 text-caption font-medium text-navy"
        >
          {hero.cta}
          <ArrowRight
            size={14}
            weight="light"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>

        <p className="mt-2 text-caption text-subtle">{caption}</p>
      </Container>
    </section>
  );
}
