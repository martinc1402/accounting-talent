import Link from "next/link";
import { LogoMark } from "./LogoMark";

/*
  Mark plus wordmark. The ledger-rule underline beneath "Talent" is the one piece
  of brand furniture on the site: a nod to a ruled accounting ledger, and it
  doubles as the active-state marker in the nav. The mark repeats that motif,
  building its "A" out of the same two rules.

  Both halves take their colour from `color` on the row, so the mark inherits it
  through currentColor and cannot drift out of sync with the wordmark.
*/
export function Logo({
  tone = "navy",
  href = "/",
  compact = false,
}: {
  tone?: "navy" | "white";
  href?: string | null;
  /*
    Drops the wordmark below sm, leaving the mark alone. Only the nav sets this:
    at 360px the logo, the CTA and the hamburger fight over 328px, and the
    wordmark is ~120px of that. The footer and the /apply header have room, so
    they keep the full lockup.

    Hiding the text costs nothing for a screen reader: the <Link> already carries
    aria-label="AccountingTalent.in home".
  */
  compact?: boolean;
}) {
  const color = tone === "white" ? "text-white" : "text-navy";
  const rule = tone === "white" ? "bg-white/40" : "bg-navy/30";

  const mark = (
    <span
      className={`flex items-center gap-2 whitespace-nowrap ${color}`}
    >
      {/* The artwork only fills the middle of its 64x64 viewBox, so the box runs
          larger than the mark looks. Sized by eye against the wordmark's cap
          height, not by arithmetic.

          The mark and the wordmark scale together. When the site's type scale was
          lifted to match Spark, bumping the wordmark alone would have left the
          mark stranded next to it: the lockup is one object, so both halves move. */}
      <LogoMark className="size-8 shrink-0 sm:size-11" />

      <span
        className={`display relative text-[21px] tracking-[-0.02em] sm:text-[24px] ${
          compact ? "hidden sm:inline" : ""
        }`}
      >
        Accounting
        <span className="relative font-normal">
          Talent
          <span
            aria-hidden
            className={`absolute -bottom-0.5 left-0 h-px w-full ${rule}`}
          />
        </span>
        {/* The TLD is a suffix, not part of the name: it recedes on size and on
            weight, so the eye reads "AccountingTalent" first. */}
        <span className="text-[0.7em] opacity-50">.in</span>
      </span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label="AccountingTalent.in home" className="shrink-0">
      {mark}
    </Link>
  );
}
